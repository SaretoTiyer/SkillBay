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
            'monto' => $precio,
            'fechaPago' => now(),
            'estado' => 'Completado',
            'metodoPago' => 'Pasarela Simulada',
            'modalidadPago' => 'virtual',
            'referenciaPago' => $this->generarReferencia('plan'),
            'fechaInicioPlan' => now()->toDateString(),
            'fechaFinPlan' => now()->addMonth()->toDateString(),
            'id_CorreoUsuario' => $user->id_CorreoUsuario,
            'id_Plan' => $plan->id_Plan,
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

        if (!empty($validated['id_Postulacion'])) {
            $postulacion = Postulacion::where('id', $validated['id_Postulacion'])
                ->where('id_Servicio', $servicio->id_Servicio)
                ->first();

            if (!$postulacion) {
                return response()->json(['message' => 'La postulacion no corresponde al servicio.'], 422);
            }
        }

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
            'id_CorreoUsuario' => $user->id_CorreoUsuario,
            'referenciaPago' => $this->generarReferencia('srv'),
            'id_Servicio' => $servicio->id_Servicio,
        ]);

        Notificacion::create([
            'mensaje' => 'Se registro un pago para tu servicio "' . $servicio->titulo . '" (' . $estado . ').',
            'estado' => 'No leido',
            'tipo' => 'servicio',
            'id_CorreoUsuario' => $servicio->id_Cliente,
        ]);

        Notificacion::create([
            'mensaje' => 'Tu pago del servicio "' . $servicio->titulo . '" fue registrado con referencia ' . $pago->referenciaPago . '.',
            'estado' => 'No leido',
            'tipo' => 'sistema',
            'id_CorreoUsuario' => $user->id_CorreoUsuario,
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

        $servicios = PagoServicio::where('id_CorreoUsuario', $user->id_CorreoUsuario)
            ->with('servicio:id_Servicio,titulo')
            ->latest('fechaPago')
            ->get();

        return response()->json([
            'success' => true,
            'pagos_plan' => $planes,
            'pagos_servicio' => $servicios,
        ]);
    }
}
