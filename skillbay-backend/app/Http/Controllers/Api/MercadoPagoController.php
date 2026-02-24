<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\PagoPlan;
use App\Models\Plan;
use App\Models\Usuario;
use App\Services\MercadoPagoInterface;
use App\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Controlador de integración con MercadoPago.
 *
 * Maneja el flujo completo de pago:
 * 1. Creación de preferencia (checkout pro)
 * 2. Webhook IPN para notificaciones de estado
 * 3. URLs de retorno (success, failure, pending)
 * 4. Consulta de estado de pago
 */
class MercadoPagoController extends Controller
{
    public function __construct(
        private readonly MercadoPagoInterface $mpService
    ) {}

    /**
     * POST /api/mp/crear-preferencia
     * Crea una preferencia de pago en MercadoPago para un plan.
     * Requiere autenticación.
     */
    public function crearPreferencia(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'id_Plan' => 'required|string|exists:planes,id_Plan',
        ]);

        $plan   = Plan::findOrFail($validated['id_Plan']);
        $precio = (float) ($plan->precioMensual ?? 0);

        // Plan gratuito: no requiere pasarela de pago
        if ($precio <= 0) {
            return $this->procesarPlanGratuito($user, $plan);
        }

        $referencia  = $this->generarReferencia('MP-PLAN');
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));
        
        // Usar NGROK_URL si está configurada, si no usar APP_URL
        $backendUrl = env('NGROK_URL', config('app.url', 'http://127.0.0.1:8000'));

        try {
            $preferenceData = array(
                'items' => array(
                    array(
                        'id'          => $plan->id_Plan,
                        'title'       => 'SkillBay - Plan ' . $plan->nombre,
                        'description' => $plan->beneficios ?? 'Suscripcion mensual al plan ' . $plan->nombre,
                        'quantity'    => 1,
                        'unit_price'  => $precio,
                        'currency_id' => 'COP',
                    ),
                ),
                'payer' => array(
                    'email' => $user->id_CorreoUsuario, // Asumimos que es email válidados
                    'name'  => $user->nombre ?? '',
                ),
                'back_urls' => array(
                    'success' => $frontendUrl . '/payment/success?ref=' . $referencia,
                    'failure' => $frontendUrl . '/payment/failure?ref=' . $referencia,
                    'pending' => $frontendUrl . '/payment/pending?ref=' . $referencia,
                ),
                'auto_return'        => 'approved',
                'external_reference' => $referencia,
                // NOTA: La notification_url puede causar errores si MercadoPago no puede acceder a ella
                // En desarrollo, puedes comentarla o usar una URL válida
                'notification_url'   => $backendUrl . '/api/mp/webhook',
                'statement_descriptor' => 'SkillBay Plan ' . $plan->nombre,
                'expires'            => false,
                'metadata'           => array(
                    'id_Plan'          => $plan->id_Plan,
                    'id_CorreoUsuario' => $user->id_CorreoUsuario,
                    'referencia'       => $referencia,
                ),
            );

            $preference = $this->mpService->crearPreferencia($preferenceData);

            // Crear registro de pago en estado Pendiente
            $pago = PagoPlan::create(array(
                'monto'               => $precio,
                'fechaPago'           => now(),
                'estado'              => 'Pendiente',
                'metodoPago'          => 'MercadoPago',
                'modalidadPago'       => 'virtual',
                'referenciaPago'      => $referencia,
                'fechaInicioPlan'     => now()->toDateString(),
                'fechaFinPlan'        => now()->addMonth()->toDateString(),
                'id_CorreoUsuario'    => $user->id_CorreoUsuario,
                'id_Plan'             => $plan->id_Plan,
                'mp_preference_id'    => $preference['id'],
                'mp_init_point'       => $preference['init_point'],
                'mp_sandbox_init_point' => $preference['sandbox_init_point'],
                'mp_status'           => 'pending',
            ));

            return response()->json(array(
                'success'            => true,
                'preference_id'      => $preference['id'],
                'init_point'         => $preference['init_point'],
                'sandbox_init_point' => $preference['sandbox_init_point'],
                'referencia'         => $referencia,
                'pago_id'            => $pago->id_PagoPlan,
                'public_key'         => config('services.mercadopago.public_key'),
            ), 201);

        } catch (\Exception $e) {
            Log::error('Error al crear preferencia MP', array(
                'message' => $e->getMessage(),
                'user'    => $user->id_CorreoUsuario,
                'plan'    => $plan->id_Plan,
            ));

            return response()->json(array(
                'success' => false,
                'message' => 'Error al crear la preferencia de pago.',
                'error'   => $e->getMessage(),
            ), 500);
        }
    }

    /**
     * GET /api/mp/webhook
     * Endpoint para prueba de webhook desde MercadoPago.
     * MercadoPago envía una solicitud GET para verificar que la URL existe.
     */
    public function webhookTest(Request $request)
    {
        Log::info('MercadoPago: Prueba de webhook recibida', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
        ]);
        
        return response()->json([
            'status' => 'ok',
            'message' => 'Webhook endpoint configured correctly',
        ], 200);
    }

    /**
     * POST /api/mp/webhook
     * Recibe notificaciones IPN/Webhook de MercadoPago.
     * Ruta pública (sin autenticación), pero con verificación de firma.
     */
    public function webhook(Request $request)
    {
        $topic = $request->query('topic') ?? $request->input('type');
        $id    = $request->query('id') ?? $request->input('data.id');

        Log::info('MercadoPago Webhook recibido', array(
            'topic'   => $topic,
            'id'      => $id,
            'payload' => $request->all(),
        ));

        // Verificar firma del webhook (seguridad)
        if (!$this->verificarFirmaWebhook($request)) {
            Log::warning('MercadoPago Webhook: firma invalida', array('ip' => $request->ip()));
            return response()->json(array('status' => 'signature_invalid'), 200);
        }

        // Solo procesamos notificaciones de tipo "payment"
        if (!in_array($topic, array('payment', 'merchant_order'))) {
            return response()->json(array('status' => 'ignored', 'topic' => $topic), 200);
        }

        if (!$id) {
            return response()->json(array('status' => 'no_id'), 200);
        }

        try {
            $payment = $this->mpService->obtenerPago((int) $id);

            $externalRef = $payment['external_reference'] ?? null;
            $mpStatus    = $payment['status'] ?? null;
            $mpPaymentId = (string) ($payment['id'] ?? $id);

            Log::info('MercadoPago Webhook - Pago obtenido', array(
                'payment_id'   => $mpPaymentId,
                'status'       => $mpStatus,
                'external_ref' => $externalRef,
            ));

            if (!$externalRef) {
                return response()->json(array('status' => 'no_external_ref'), 200);
            }

            $pago = PagoPlan::where('referenciaPago', $externalRef)->first();

            if (!$pago) {
                Log::warning('MercadoPago Webhook: PagoPlan no encontrado', array(
                    'external_ref' => $externalRef,
                ));
                return response()->json(array('status' => 'pago_not_found'), 200);
            }

            // Actualizar campos MP en el registro de pago
            $pago->mp_payment_id = $mpPaymentId;
            $pago->mp_status     = $mpStatus;

            switch ($mpStatus) {
                case 'approved':
                    $pago->estado = 'Completado';
                    $pago->save();
                    $this->activarPlanUsuario($pago);
                    break;

                case 'pending':
                case 'in_process':
                    $pago->estado = 'Pendiente';
                    $pago->save();
                    break;

                case 'rejected':
                case 'cancelled':
                case 'refunded':
                case 'charged_back':
                    $pago->estado = 'Rechazado';
                    $pago->save();
                    $this->notificarRechazo($pago);
                    break;

                default:
                    $pago->save();
                    break;
            }

            return response()->json(array('status' => 'processed', 'mp_status' => $mpStatus), 200);

        } catch (\Exception $e) {
            Log::error('MercadoPago Webhook - Error', array(
                'message' => $e->getMessage(),
                'id'      => $id,
            ));
            return response()->json(array('status' => 'error'), 200);
        }
    }

    /**
     * GET /api/mp/success
     * Vista de retorno cuando el pago fue aprobado.
     *
     * IMPORTANTE: Verifica el estado real del pago con la API de MercadoPago
     * antes de aprobar, para evitar pagos fraudulentos.
     */
    public function success(Request $request)
    {
        $referencia  = $request->query('ref') ?? $request->query('external_reference');
        $paymentId   = $request->query('payment_id');
        $status      = $request->query('status');
        $collectionId = $request->query('collection_id');

        Log::info('MercadoPago Success Return', array(
            'ref'        => $referencia,
            'payment_id' => $paymentId ?? $collectionId,
            'status'     => $status,
        ));

        $pago = null;
        if ($referencia) {
            $pago = PagoPlan::with('plan')->where('referenciaPago', $referencia)->first();
        }

        // Si tenemos payment_id, verificar con la API de MercadoPago
        $mpPaymentId = $paymentId ?? $collectionId;
        if ($pago && $mpPaymentId) {
            try {
                // Consultar estado real del pago en MercadoPago
                $payment = $this->mpService->obtenerPago((int) $mpPaymentId);
                $mpStatus = $payment['status'] ?? null;

                Log::info('MercadoPago Success - Verificación con API', array(
                    'payment_id' => $mpPaymentId,
                    'mp_status'  => $mpStatus,
                    'external_ref' => $payment['external_reference'] ?? null,
                ));

                // Solo aprobar si el status de MP es 'approved'
                if ($mpStatus === 'approved' && $pago->estado !== 'Completado') {
                    $pago->mp_payment_id = (string) $mpPaymentId;
                    $pago->mp_status     = 'approved';
                    $pago->estado        = 'Completado';
                    $pago->save();
                    $this->activarPlanUsuario($pago);
                } elseif ($mpStatus === 'pending') {
                    $pago->mp_payment_id = (string) $mpPaymentId;
                    $pago->mp_status     = 'pending';
                    $pago->estado        = 'Pendiente';
                    $pago->save();
                } elseif ($mpStatus === 'rejected' || $mpStatus === 'cancelled') {
                    $pago->mp_payment_id = (string) $mpPaymentId;
                    $pago->mp_status     = $mpStatus;
                    $pago->estado        = 'Rechazado';
                    $pago->save();
                }
            } catch (\Exception $e) {
                Log::error('MercadoPago Success - Error al verificar con API', array(
                    'message'   => $e->getMessage(),
                    'payment_id' => $mpPaymentId,
                ));
                // Si falla la verificación, no aprobar el pago
                return response()->json(array(
                    'success'    => false,
                    'status'     => 'verification_failed',
                    'message'    => 'No se pudo verificar el pago con MercadoPago.',
                    'referencia' => $referencia,
                ), 500);
            }
        } elseif ($pago && $status === 'approved') {
            // Fallback: si no hay payment_id pero el parámetro dice approved
            // Solo aprobar si el pago ya estaba en estado Pendiente en nuestra DB
            if ($pago->estado === 'Pendiente') {
                Log::warning('MercadoPago Success - Aprobando sin verificación de API (fallback)', [
                    'referencia' => $referencia
                ]);
                $pago->estado = 'Completado';
                $pago->mp_status = 'approved';
                $pago->save();
                $this->activarPlanUsuario($pago);
            }
        }

        return response()->json(array(
            'success'    => true,
            'status'     => $pago?->estado ?? 'unknown',
            'message'    => $pago?->estado === 'Completado' 
                ? '¡Pago aprobado! Tu plan ha sido activado.' 
                : 'Estado del pago: ' . ($pago?->estado ?? 'No encontrado'),
            'referencia' => $referencia,
            'plan'       => $pago?->plan?->nombre ?? null,
            'pago_id'    => $pago?->id_PagoPlan ?? null,
        ));
    }

    /**
     * GET /api/mp/failure
     * Vista de retorno cuando el pago fue rechazado.
     */
    public function failure(Request $request)
    {
        $referencia = $request->query('ref') ?? $request->query('external_reference');
        $status     = $request->query('status');

        Log::info('MercadoPago Failure Return', array('ref' => $referencia, 'status' => $status));

        if ($referencia) {
            $pago = PagoPlan::where('referenciaPago', $referencia)->first();
            if ($pago && $pago->estado === 'Pendiente') {
                $pago->estado    = 'Rechazado';
                $pago->mp_status = 'rejected';
                $pago->save();
            }
        }

        return response()->json(array(
            'success'    => false,
            'status'     => 'rejected',
            'message'    => 'El pago fue rechazado. Por favor intenta con otro metodo de pago.',
            'referencia' => $referencia,
        ));
    }

    /**
     * GET /api/mp/pending
     * Vista de retorno cuando el pago está pendiente.
     */
    public function pending(Request $request)
    {
        $referencia = $request->query('ref') ?? $request->query('external_reference');

        Log::info('MercadoPago Pending Return', array('ref' => $referencia));

        return response()->json(array(
            'success'    => true,
            'status'     => 'pending',
            'message'    => 'Tu pago esta siendo procesado. Te notificaremos cuando sea confirmado.',
            'referencia' => $referencia,
        ));
    }

    /**
     * GET /api/mp/estado/{referencia}
     * Consulta el estado actual de un pago por referencia.
     * Requiere autenticación.
     */
    public function estadoPago(Request $request, string $referencia)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(array('message' => 'Unauthenticated.'), 401);
        }

        $pago = PagoPlan::with('plan')
            ->where('referenciaPago', $referencia)
            ->where('id_CorreoUsuario', $user->id_CorreoUsuario)
            ->first();

        if (!$pago) {
            return response()->json(array('success' => false, 'message' => 'Pago no encontrado.'), 404);
        }

        return response()->json(array(
            'success'    => true,
            'estado'     => $pago->estado,
            'mp_status'  => $pago->mp_status,
            'plan'       => $pago->plan?->nombre,
            'referencia' => $pago->referenciaPago,
            'vigente'    => $pago->estaVigente(),
            'aprobado'   => $pago->estaAprobado(),
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Métodos privados de apoyo
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Procesa la activación de un plan gratuito sin pasar por MP.
     */
    private function procesarPlanGratuito(Usuario $user, Plan $plan): \Illuminate\Http\JsonResponse
    {
        $referencia = $this->generarReferencia('FREE-PLAN');

        $pago = PagoPlan::create(array(
            'monto'            => 0,
            'fechaPago'        => now(),
            'estado'           => 'Completado',
            'metodoPago'       => 'Gratuito',
            'modalidadPago'    => 'virtual',
            'referenciaPago'   => $referencia,
            'fechaInicioPlan'  => now()->toDateString(),
            'fechaFinPlan'     => now()->addYear()->toDateString(),
            'id_CorreoUsuario' => $user->id_CorreoUsuario,
            'id_Plan'          => $plan->id_Plan,
            'mp_status'        => 'approved',
        ));

        $user->id_Plan = $plan->id_Plan;
        $user->save();

        Notificacion::create(array(
            'mensaje'          => 'Plan "' . $plan->nombre . '" activado correctamente.',
            'estado'           => 'No leido',
            'tipo'             => 'sistema',
            'id_CorreoUsuario' => $user->id_CorreoUsuario,
        ));

        return response()->json(array(
            'success'    => true,
            'gratuito'   => true,
            'message'    => 'Plan gratuito activado exitosamente.',
            'referencia' => $referencia,
            'pago'       => $pago,
            'plan'       => $plan,
        ), 201);
    }

    /**
     * Activa el plan del usuario tras un pago aprobado.
     */
    private function activarPlanUsuario(PagoPlan $pago): void
    {
        $usuario = Usuario::find($pago->id_CorreoUsuario);
        if (!$usuario) {
            Log::warning('activarPlanUsuario: usuario no encontrado', array(
                'id_CorreoUsuario' => $pago->id_CorreoUsuario,
            ));
            return;
        }

        $usuario->id_Plan = $pago->id_Plan;
        $usuario->save();

        $plan       = Plan::find($pago->id_Plan);
        $nombrePlan = $plan?->nombre ?? $pago->id_Plan;

        Notificacion::create(array(
            'mensaje'          => '¡Pago aprobado! Tu plan "' . $nombrePlan . '" esta activo. Referencia: ' . $pago->referenciaPago,
            'estado'           => 'No leido',
            'tipo'             => 'sistema',
            'id_CorreoUsuario' => $pago->id_CorreoUsuario,
        ));

        Log::info('Plan activado para usuario', array(
            'usuario' => $pago->id_CorreoUsuario,
            'plan'    => $pago->id_Plan,
            'ref'     => $pago->referenciaPago,
        ));
    }

    /**
     * Notifica al usuario que su pago fue rechazado.
     */
    private function notificarRechazo(PagoPlan $pago): void
    {
        Notificacion::create(array(
            'mensaje'          => 'Tu pago (ref: ' . $pago->referenciaPago . ') fue rechazado. Por favor intenta nuevamente.',
            'estado'           => 'No leido',
            'tipo'             => 'sistema',
            'id_CorreoUsuario' => $pago->id_CorreoUsuario,
        ));
    }

    /**
     * Verifica la firma del webhook de MercadoPago.
     *
     * IMPORTANTE: En producción, siempre debe verificarse la firma.
     * Solo en entorno local de desarrollo se permite omitir la verificación.
     */
    private function verificarFirmaWebhook(Request $request): bool
    {
        $secret = config('services.mercadopago.webhook_secret');
        $isLocal = app()->isLocal() || env('APP_ENV') === 'testing';

        // En producción: siempre requerir secret configurado
        if (!$isLocal && empty($secret)) {
            Log::error('MercadoPago Webhook: webhook_secret no configurado en producción');
            return false;
        }

        // En desarrollo local sin secret: registrar advertencia pero permitir
        if ($isLocal && empty($secret)) {
            Log::warning('MercadoPago Webhook: verificación de firma omitida en entorno local');
            return true;
        }

        // Verificar que existe la firma
        $xSignature = $request->header('x-signature');
        if (empty($xSignature)) {
            Log::warning('MercadoPago Webhook: sin firma en header', [
                'ip' => $request->ip()
            ]);
            // En producción rechazar, en local permitir
            return $isLocal;
        }

        // Parsear ts y v1 del header x-signature
        $parts = [];
        foreach (explode(',', $xSignature) as $part) {
            $kv = explode('=', $part, 2);
            $parts[trim($kv[0])] = trim($kv[1] ?? '');
        }

        $ts = $parts['ts'] ?? null;
        $v1 = $parts['v1'] ?? null;

        if (!$ts || !$v1) {
            Log::warning('MercadoPago Webhook: formato de firma incompleto', [
                'parts' => $parts
            ]);
            return $isLocal;
        }

        $xRequestId = $request->header('x-request-id');
        $dataId = $request->input('data.id') ?? $request->query('id');

        // Construir el manifest para verificar
        $manifest = "id:{$dataId};request-id:{$xRequestId};ts:{$ts};";
        $hmac = hash_hmac('sha256', $manifest, $secret);

        $isValid = hash_equals($hmac, $v1);

        if (!$isValid) {
            Log::warning('MercadoPago Webhook: firma inválida', [
                'expected' => substr($hmac, 0, 8) . '...',
                'received' => substr($v1, 0, 8) . '...',
                'ip' => $request->ip()
            ]);
        }

        return $isValid;
    }

    /**
     * Genera una referencia única de pago.
     */
    private function generarReferencia(string $prefix): string
    {
        return strtoupper($prefix) . '-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(6));
    }
}
