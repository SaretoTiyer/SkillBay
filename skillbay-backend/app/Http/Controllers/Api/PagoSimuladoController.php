<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Postulacion;
use App\Models\Usuario;
use App\Services\PagoSimuladoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PagoSimuladoController extends Controller
{
    public function __construct(
        private PagoSimuladoService $pagoService
    ) {}

    public function iniciarPagoPlan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_plan' => 'required|string|exists:planes,id_Plan',
            'metodo' => 'required|string|in:tarjeta,efectivo,nequi,bancolombia_qr',
        ]);

        $usuario = $request->user();

        $resultado = $this->pagoService->iniciarPagoPlan(
            $validated['id_plan'],
            $usuario->id_CorreoUsuario,
            $validated['metodo']
        );

        return response()->json([
            'success' => true,
            'data' => $resultado,
        ]);
    }

    public function iniciarPagoServicio(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_postulacion' => 'required|integer|exists:postulaciones,id',
            'metodo' => 'required|string|in:tarjeta,efectivo,nequi,bancolombia_qr',
            'modalidad_servicio' => 'required|string|in:virtual,presencial',
        ]);

        $usuario = $request->user();

        $resultado = $this->pagoService->iniciarPagoServicio(
            $validated['id_postulacion'],
            $usuario->id_CorreoUsuario,
            $validated['metodo'],
            $validated['modalidad_servicio']
        );

        return response()->json([
            'success' => true,
            'data' => $resultado,
        ]);
    }

    public function procesarPago(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_pago' => 'required|integer',
            'tipo' => 'required|string|in:plan,servicio',
            'datos_pago' => 'nullable|array',
            'datos_pago.numero_tarjeta' => 'nullable|string',
            'datos_pago.titular' => 'nullable|string',
            'datos_pago.fecha_vencimiento' => 'nullable|string',
            'datos_pago.cvv' => 'nullable|string',
            'datos_pago.cuenta_banco' => 'nullable|string',
        ]);

        $resultado = $this->pagoService->procesarPago(
            $validated['id_pago'],
            $validated['tipo'],
            $validated['datos_pago'] ?? []
        );

        $estadoFinal = $resultado['estado'];

        return response()->json([
            'success' => $estadoFinal === PagoSimuladoService::ESTADO_COMPLETADO,
            'data' => $resultado,
        ]);
    }

    public function aprobarAutomatico(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_pago' => 'required|integer',
            'tipo' => 'required|string|in:plan,servicio',
            'segundos' => 'nullable|integer|min:1|max:30',
        ]);

        $segundos = $validated['segundos'] ?? 5;

        $resultado = $this->pagoService->aprobarPagoAutomatico(
            $validated['id_pago'],
            $validated['tipo']
        );

        return response()->json([
            'success' => true,
            'data' => $resultado,
            'aprobar_despues_de' => $segundos,
        ]);
    }

    public function obtenerEstado(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_pago' => 'required|integer',
            'tipo' => 'required|string|in:plan,servicio',
        ]);

        $resultado = $this->pagoService->obtenerEstado(
            $validated['id_pago'],
            $validated['tipo']
        );

        if (! $resultado) {
            return response()->json([
                'success' => false,
                'message' => 'Pago no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado,
        ]);
    }

    public function metodosPago(Request $request): JsonResponse
    {
        $idPostulacion = $request->query('postulacion');
        $metodosPago = [];

        if ($idPostulacion) {
            $postulacion = Postulacion::with(['servicio.cliente_usuario'])->find($idPostulacion);
            if ($postulacion && $postulacion->servicio) {
                $receptor = $postulacion->servicio->cliente_usuario;
                $metodosPago = $this->buildMetodosPago($receptor);
            }
        }

        if (empty($metodosPago)) {
            $metodosPago = $this->buildMetodosPago(null);
        }

        return response()->json([
            'success' => true,
            'data' => $metodosPago,
        ]);
    }

    private function buildMetodosPago(?Usuario $receptor): array
    {
        $metodos = [];
        $activos = $receptor?->metodos_pago_activos ?? ['tarjeta', 'efectivo'];

        if (in_array('tarjeta', $activos)) {
            $metodos[] = [
                'id' => 'tarjeta',
                'nombre' => 'Tarjeta de Crédito/Débito',
                'descripcion' => 'Paga con Visa, Mastercard, American Express',
                'icono' => 'credit-card',
                'categoria' => 'digital',
                'requiere_datos' => true,
            ];
        }

        if ($receptor) {
            if (in_array('nequi', $activos) && ($receptor->nequi_numero || $receptor->nequi_qr)) {
                $metodos[] = [
                    'id' => 'nequi',
                    'nombre' => 'Nequi',
                    'descripcion' => $receptor->nequi_numero ? 'Paga con Nequi al '.$receptor->nequi_numero : 'Paga con QR de Nequi',
                    'icono' => 'smartphone',
                    'categoria' => 'digital',
                    'requiere_datos' => false,
                    'nequi_numero' => $receptor->nequi_numero,
                    'nequi_nombre' => $receptor->nequi_nombre,
                    'nequi_qr' => $receptor->nequi_qr,
                ];
            }

            if (in_array('bancolombia_qr', $activos) && $receptor->bancolombia_qr) {
                $metodos[] = [
                    'id' => 'bancolombia_qr',
                    'nombre' => 'QR Bancolombia',
                    'descripcion' => 'Paga con código QR de Bancolombia',
                    'icono' => 'qr-code',
                    'categoria' => 'digital',
                    'requiere_datos' => false,
                    'bancolombia_qr' => $receptor->bancolombia_qr,
                ];
            }
        }

        if (in_array('efectivo', $activos)) {
            $metodos[] = [
                'id' => 'efectivo',
                'nombre' => 'Efectivo',
                'descripcion' => 'Paga en efectivo al momento del servicio',
                'icono' => 'banknotes',
                'categoria' => 'efectivo',
                'requiere_datos' => false,
            ];
        }

        return $metodos;
    }

    public function subirComprobante(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_pago' => 'required|integer|exists:pago_servicios,id_PagoServicio',
            'comprobante' => 'required|file|mimes:jpeg,png,jpg,gif,pdf,txt|max:5120',
        ]);

        $user = $request->user();

        $pago = \App\Models\PagoServicio::findOrFail($validated['id_pago']);

        if (! $pago) {
            return response()->json([
                'success' => false,
                'message' => 'Pago no encontrado',
            ], 404);
        }

        if ($pago->id_Pagador !== $user->id_CorreoUsuario) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado',
            ], 403);
        }

        if ($pago->metodoPago !== 'tarjeta' && $pago->metodoPago !== 'nequi' && $pago->metodoPago !== 'bancolombia_qr') {
            return response()->json([
                'success' => false,
                'message' => 'Este método de pago no requiere comprobante',
            ], 400);
        }

        try {
            if ($pago->comprobante && Storage::disk('public')->exists($pago->comprobante)) {
                Storage::disk('public')->delete($pago->comprobante);
            }

            $path = $request->file('comprobante')->store('comprobantes', 'public');
            $pago->comprobante = $path;
            $pago->fecha_comprobante = now();
            $pago->save();

            return response()->json([
                'success' => true,
                'message' => 'Comprobante subido correctamente',
                'data' => [
                    'comprobante' => $path,
                    'fecha_comprobante' => $pago->fecha_comprobante,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el comprobante',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
