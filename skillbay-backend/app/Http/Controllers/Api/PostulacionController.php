<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\Postulacion;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostulacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Get applications made by the user, including service and service's client details
        $postulaciones = Postulacion::where('id_Usuario', $user->id_CorreoUsuario)
            ->with(['servicio', 'servicio.cliente_usuario' => function ($query) {
                $query->select('id_CorreoUsuario', 'nombre', 'apellido');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($postulaciones);
    }

    /**
     * Solicitudes recibidas para servicios del usuario autenticado.
     */
    public function solicitudesRecibidas(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $solicitudes = Postulacion::with([
            'servicio:id_Servicio,titulo,id_Cliente,id_Categoria,imagen,estado',
            'servicio.categoria:id_Categoria,nombre',
            'usuario:id_CorreoUsuario,nombre,apellido,ciudad',
        ])
            ->whereHas('servicio', function ($query) use ($user) {
                $query->where('id_Cliente', $user->id_CorreoUsuario);
            })
            ->orderByRaw("CASE estado WHEN 'pendiente' THEN 0 WHEN 'aceptada' THEN 1 WHEN 'rechazada' THEN 2 WHEN 'cancelada' THEN 3 ELSE 4 END")
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($solicitudes);
    }

    /**
     * Priorizar o actualizar estado de una solicitud recibida por el dueno del servicio.
     */
    public function actualizarEstadoSolicitud(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'estado' => 'required|in:pendiente,aceptada,rechazada,en_progreso',
        ]);

        $postulacion = Postulacion::with(['servicio'])
            ->where('id', $id)
            ->whereHas('servicio', function ($query) use ($user) {
                $query->where('id_Cliente', $user->id_CorreoUsuario);
            })
            ->first();

        if (!$postulacion) {
            return response()->json(['message' => 'Solicitud no encontrada o no autorizada.'], 404);
        }

        $postulacion->estado = $validated['estado'];
        $postulacion->save();

        Notificacion::create([
            'mensaje' => 'Tu solicitud para "' . ($postulacion->servicio->titulo ?? 'servicio') . '" ahora esta ' . $validated['estado'] . '.',
            'estado' => 'No leido',
            'tipo' => 'postulacion',
            'id_CorreoUsuario' => $postulacion->id_Usuario,
        ]);

        return response()->json([
            'success' => true,
            'postulacion' => $postulacion,
        ]);
    }

    /**
     * El cliente (dueño del servicio) marca el trabajo como completado.
     * Solo se puede marcar como completado si el estado actual es 'en_progreso'.
     */
    public function marcarCompletado(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $postulacion = Postulacion::with(['servicio'])
            ->where('id', $id)
            ->whereHas('servicio', function ($query) use ($user) {
                $query->where('id_Cliente', $user->id_CorreoUsuario);
            })
            ->first();

        if (!$postulacion) {
            return response()->json(['message' => 'Solicitud no encontrada o no autorizada.'], 404);
        }

        if ($postulacion->estado !== 'en_progreso') {
            return response()->json(['message' => 'Solo se puede marcar como completado un trabajo en progreso.'], 422);
        }

        $postulacion->estado = 'completada';
        $postulacion->save();

        Notificacion::create([
            'mensaje' => 'El trabajo para "' . ($postulacion->servicio->titulo ?? 'servicio') . '" ha sido marcado como completado. Ya puedes proceder con el pago.',
            'estado' => 'No leido',
            'tipo' => 'postulacion',
            'id_CorreoUsuario' => $postulacion->id_Usuario,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trabajo marcado como completado.',
            'postulacion' => $postulacion,
        ]);
    }

    /**
     * Verificar si una postulación está lista para pago.
     * Retorna true solo si el estado es 'completada'.
     */
    public function verificarListoParaPago(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $postulacion = Postulacion::with(['servicio', 'usuario'])
            ->where('id', $id)
            ->first();

        if (!$postulacion) {
            return response()->json(['message' => 'Postulación no encontrada.'], 404);
        }

        // Solo el cliente (dueño del servicio) puede verificar
        $esCliente = $postulacion->servicio && $postulacion->servicio->id_Cliente === $user->id_CorreoUsuario;

        return response()->json([
            'success' => true,
            'listo_para_pago' => $postulacion->estado === 'completada',
            'estado' => $postulacion->estado,
            'es_cliente' => $esCliente,
            'postulacion' => $postulacion,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->bloqueado) {
            return response()->json(['message' => 'Tu cuenta esta bloqueada.'], 403);
        }

        $request->validate([
            'id_Servicio' => 'required|exists:servicios,id_Servicio',
            'mensaje' => 'required|string',
            'presupuesto' => 'nullable|numeric',
            'tiempo_estimado' => 'nullable|string',
        ]);

        // Prevent double application
        $exists = Postulacion::where('id_Usuario', $user->id_CorreoUsuario)
            ->where('id_Servicio', $request->id_Servicio)
            ->where('estado', '!=', 'cancelada')
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya te has postulado a este servicio.'], 422);
        }

        $postulacion = Postulacion::create([
            'id_Servicio' => $request->id_Servicio,
            'id_Usuario' => $user->id_CorreoUsuario,
            'mensaje' => $request->mensaje,
            'presupuesto' => $request->presupuesto,
            'tiempo_estimado' => $request->tiempo_estimado,
            'estado' => 'pendiente'
        ]);

        if ($user->rol === 'cliente') {
            $user->rol = 'ofertante';
            $user->save();
        }

        $servicio = Servicio::find($request->id_Servicio);
        if ($servicio) {
            Notificacion::create([
                'mensaje' => 'Nueva postulacion para tu servicio "' . $servicio->titulo . '".',
                'estado' => 'No leido',
                'tipo' => 'postulacion',
                'id_CorreoUsuario' => $servicio->id_Cliente,
            ]);
        }

        return response()->json($postulacion, 201);
    }

    /**
     * Actualizar una postulacion del usuario autenticado.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $postulacion = Postulacion::where('id', $id)
            ->where('id_Usuario', $user->id_CorreoUsuario)
            ->with('servicio')
            ->first();

        if (!$postulacion) {
            return response()->json(['message' => 'Postulacion no encontrada.'], 404);
        }

        if ($postulacion->estado !== 'pendiente') {
            return response()->json(['message' => 'Solo puedes editar postulaciones pendientes.'], 422);
        }

        $validated = $request->validate([
            'mensaje' => 'required|string|min:5|max:2000',
            'presupuesto' => 'nullable|numeric|min:0',
            'tiempo_estimado' => 'nullable|string|max:191',
        ]);

        $postulacion->update($validated);

        if ($postulacion->servicio) {
            Notificacion::create([
                'mensaje' => 'Una postulacion fue actualizada en tu servicio "' . $postulacion->servicio->titulo . '".',
                'estado' => 'No leido',
                'tipo' => 'postulacion',
                'id_CorreoUsuario' => $postulacion->servicio->id_Cliente,
            ]);
        }

        return response()->json([
            'success' => true,
            'postulacion' => $postulacion,
        ]);
    }

    /**
     * Cancelar una postulacion del usuario autenticado.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $postulacion = Postulacion::where('id', $id)
            ->where('id_Usuario', $user->id_CorreoUsuario)
            ->with('servicio')
            ->first();

        if (!$postulacion) {
            return response()->json(['message' => 'Postulacion no encontrada.'], 404);
        }

        if ($postulacion->estado === 'cancelada') {
            return response()->json(['message' => 'La postulacion ya esta cancelada.'], 422);
        }

        $postulacion->estado = 'cancelada';
        $postulacion->save();

        if ($postulacion->servicio) {
            Notificacion::create([
                'mensaje' => 'Una postulacion fue cancelada en tu servicio "' . $postulacion->servicio->titulo . '".',
                'estado' => 'No leido',
                'tipo' => 'postulacion',
                'id_CorreoUsuario' => $postulacion->servicio->id_Cliente,
            ]);
        }

        $pendientesActivas = Postulacion::where('id_Usuario', $user->id_CorreoUsuario)
            ->whereIn('estado', ['pendiente', 'aceptada', 'rechazada'])
            ->exists();

        if ($user->rol === 'ofertante' && !$pendientesActivas) {
            $user->rol = 'cliente';
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Postulacion cancelada correctamente.',
            'postulacion' => $postulacion,
        ]);
    }

    /**
     * Listado general de postulaciones (solo admin).
     */
    public function adminIndex(Request $request)
    {
        $admin = $request->user();
        if (!$admin || $admin->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $postulaciones = Postulacion::with([
            'servicio:id_Servicio,titulo,id_Cliente',
            'usuario:id_CorreoUsuario,nombre,apellido',
        ])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'total' => $postulaciones->count(),
            'postulaciones' => $postulaciones,
        ]);
    }

    /**
     * Actualizar estado de postulacion (solo admin).
     */
    public function cambiarEstado(Request $request, $id)
    {
        $admin = $request->user();
        if (!$admin || $admin->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'estado' => 'required|in:pendiente,aceptada,rechazada,cancelada',
        ]);

        $postulacion = Postulacion::with('servicio')->findOrFail($id);
        $postulacion->estado = $validated['estado'];
        $postulacion->save();

        Notificacion::create([
            'mensaje' => 'Tu postulacion para "' . ($postulacion->servicio->titulo ?? 'servicio') . '" ahora esta ' . $validated['estado'] . '.',
            'estado' => 'No leido',
            'tipo' => 'postulacion',
            'id_CorreoUsuario' => $postulacion->id_Usuario,
        ]);

        return response()->json([
            'success' => true,
            'postulacion' => $postulacion,
        ]);
    }
}
