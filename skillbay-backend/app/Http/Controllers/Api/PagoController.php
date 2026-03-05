<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\PagoPlan;
use App\Models\PagoServicio;
use App\Models\Plan;
use App\Models\Postulacion;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PagoController extends Controller
{
    private function generarReferencia(string $prefix): string
    {
        return strtoupper($prefix) . '-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(6));
    }

    public function pagarPlan(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'id_Plan' => 'required|exists:planes,id_Plan',
            'modalidadPago' => 'required|in:virtual',
        ]);

        $plan = Plan::findOrFail($validated['id_Plan']);
        $precio = (float) ($plan->precioMensual ?? 0);

        $pago = PagoPlan::create([
            'monto'            => $precio,
            'fechaPago'        => now(),
            'estado'           => 'Completado',
            'metodoPago'       => 'Pasarela Simulada',
            'modalidadPago'    => 'virtual',
            'referenciaPago'   => $this->generarReferencia('plan'),
            'fechaInicioPlan'  => now()->toDateString(),
            'fechaFinPlan'     => now()->addMonth()->toDateString(),
            'id_CorreoUsuario' => $user->id_CorreoUsuario,
            'id_Plan'          => $plan->id_Plan,
            'mp_status'        => 'approved', // Simulado como aprobado
        ]);

        $user->id_Plan = $plan->id_Plan;
        $user->save();

        Notificacion::create([
            'mensaje' => 'Pago de plan confirmado. Tu plan actual es "' . $plan->nombre . '".',
            'estado' => 'No leido',
            'tipo' => 'sistema',
            'id_CorreoUsuario' => $user->id_CorreoUsuario,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pago de plan simulado exitosamente.',
            'pago' => $pago,
            'plan' => $plan,
        ], 201);
    }

    public function pagarServicio(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'id_Servicio' => 'required|exists:servicios,id_Servicio',
            'modalidadPago' => 'required|in:efectivo,virtual',
            'modalidadServicio' => 'required|in:presencial,virtual',
            'identificacionCliente' => 'required|string|min:5|max:40',
            'origenSolicitud' => 'required|in:servicio,postulacion',
            'id_Postulacion' => 'nullable|exists:postulaciones,id',
            'monto' => 'nullable|numeric|min:0',
        ]);

        $servicio = Servicio::with('cliente_usuario')->findOrFail($validated['id_Servicio']);
        $monto = isset($validated['monto']) ? (float) $validated['monto'] : (float) ($servicio->precio ?? 0);
        $estado = $validated['modalidadPago'] === 'virtual' ? 'Completado' : 'Pendiente';

        // Verificar que existe una postulación completada para este servicio
        $postulacionCompletada = Postulacion::with('servicio')->where('id_Servicio', $servicio->id_Servicio)
            ->where('estado', 'completada')
            ->first();

        if (!$postulacionCompletada) {
            return response()->json([
                'message' => 'No se puede procesar el pago. El trabajo debe estar marcado como completado por el cliente antes de pagar.',
            ], 422);
        }

        if (!empty($validated['id_Postulacion'])) {
            $postulacion = Postulacion::with('servicio')->where('id', $validated['id_Postulacion'])
                ->where('id_Servicio', $servicio->id_Servicio)
                ->where('estado', 'completada')
                ->first();

            if (!$postulacion) {
                return response()->json(['message' => 'La postulacion no corresponde al servicio o no esta completada.'], 422);
            }
        } else {
            // Usar la postulación completada encontrada
            $postulacion = $postulacionCompletada;
        }

        // Determinar quién paga y quién recibe usando la lógica del modelo Postulacion
        // Esto considera el tipo_postulacion: 'postulante' o 'solicitante'
        $idClientePaga = $postulacion->getUsuarioQuePaga();
        $idPrestadorRecibe = $postulacion->getUsuarioQueRecibe();

        $pago = PagoServicio::create([
            'monto' => $monto,
            'fechaPago' => now(),
            'estado' => $estado,
            'metodoPago' => 'Pasarela Simulada',
            'modalidadPago' => $validated['modalidadPago'],
            'modalidadServicio' => $validated['modalidadServicio'],
            'identificacionCliente' => $validated['identificacionCliente'],
            'origenSolicitud' => $validated['origenSolicitud'],
            'id_Postulacion' => $validated['id_Postulacion'] ?? null,
            'referenciaPago' => $this->generarReferencia('srv'),
            'id_Servicio' => $servicio->id_Servicio,
            // Flujo de dinero basado en tipo_postulacion:
            // - 'postulante': el dueño de la oportunidad (id_Cliente) paga al postulante (id_Usuario)
            // - 'solicitante': el solicitante (id_Usuario) paga al proveedor del servicio (id_Cliente)
            'id_Pagador'  => $idClientePaga,       // El que PAGA
            'id_Receptor' => $idPrestadorRecibe,   // El que RECIBE
        ]);

        // Notificación al RECEPTOR (quien recibe el pago)
        Notificacion::create([
            'mensaje' => 'Has recibido un pago por el servicio "' . $servicio->titulo . '". El cliente completó el pago.',
            'estado' => 'No leido',
            'tipo' => 'pago',
            'id_CorreoUsuario' => $idPrestadorRecibe,
        ]);

        // Notificación al PAGADOR (quien realizó el pago)
        Notificacion::create([
            'mensaje' => 'Tu pago del servicio "' . $servicio->titulo . '" fue registrado con referencia ' . $pago->referenciaPago . '.',
            'estado' => 'No leido',
            'tipo' => 'sistema',
            'id_CorreoUsuario' => $idClientePaga,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pago de servicio simulado exitosamente.',
            'pago' => $pago,
        ], 201);
    }

    public function historial(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $planes = PagoPlan::where('id_CorreoUsuario', $user->id_CorreoUsuario)
            ->with('plan:id_Plan,nombre')
            ->latest('fechaPago')
            ->get();

        // Obtener pagos de servicios donde el usuario es:
        // - El pagador (id_Pagador): quien transfirió el dinero
        // - El receptor (id_Receptor): quien recibió el dinero
        $servicios = PagoServicio::where('id_Pagador', $user->id_CorreoUsuario)
            ->orWhere('id_Receptor', $user->id_CorreoUsuario)
            ->with('servicio:id_Servicio,titulo')
            ->with('pagador:id_CorreoUsuario,nombre,apellido')
            ->with('receptor:id_CorreoUsuario,nombre,apellido')
            ->latest('fechaPago')
            ->get();

        // Agregar información sobre el rol del usuario en cada pago
        $servicios->transform(function ($pago) use ($user) {
            $pago->es_pagador  = $pago->id_Pagador  === $user->id_CorreoUsuario;
            $pago->es_receptor = $pago->id_Receptor === $user->id_CorreoUsuario;
            return $pago;
        });

        return response()->json([
            'success' => true,
            'pagos_plan' => $planes,
            'pagos_servicio' => $servicios,
        ]);
    }
}
