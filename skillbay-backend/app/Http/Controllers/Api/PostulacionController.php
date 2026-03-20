<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\Postulacion;
use App\Models\Resena;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostulacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var Usuario $user */
        $user = Auth::user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Get applications made by the user, including service and service's client details
        $postulaciones = Postulacion::where('id_Usuario', $user->id_CorreoUsuario)
            ->with(['servicio', 'servicio.cliente_usuario' => function ($query) {
                $query->select('id_CorreoUsuario', 'nombre', 'apellido');
            }, 'usuario' => function ($query) {
                $query->select('id_CorreoUsuario', 'nombre', 'apellido');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        // Agregar tipo_postulacion a cada postulación para uso del frontend
        $postulaciones->transform(function ($postulacion) use ($user) {
            $postulacion->tipo_postulacion = $postulacion->tipo_postulacion ?? 'postulante';
            // Verificar si el usuario ya calificó esta postulación
            $postulacion->ya_califico = Resena::where('id_Servicio', $postulacion->id_Servicio)
                ->where('id_CorreoUsuario', $user->id_CorreoUsuario)
                ->where('id_Postulacion', $postulacion->id)
                ->exists();

            return $postulacion;
        });

        return response()->json($postulaciones);
    }

    /**
     * Solicitudes recibidas para servicios del usuario autenticado.
     */
    public function solicitudesRecibidas(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $solicitudes = Postulacion::with([
            'servicio:id_Servicio,titulo,id_Cliente,id_Categoria,imagen,estado,tipo',
            'servicio.categoria:id_Categoria,nombre,grupo',
            'usuario:id_CorreoUsuario,nombre,apellido,ciudad',
        ])
            ->whereHas('servicio', function ($query) use ($user) {
                $query->where('id_Cliente', $user->id_CorreoUsuario);
            })
            ->orderByRaw("CASE estado WHEN 'pendiente' THEN 0 WHEN 'aceptada' THEN 1 WHEN 'rechazada' THEN 2 WHEN 'cancelada' THEN 3 ELSE 4 END")
            ->orderBy('created_at', 'desc')
            ->get();

        // Agregar tipo_postulacion a cada solicitud para uso del frontend
        $solicitudes->transform(function ($solicitud) use ($user) {
            $solicitud->tipo_postulacion = $solicitud->tipo_postulacion ?? 'postulante';
            // Verificar si el usuario (como receptor) ya calificó esta solicitud
            $solicitud->ya_califico_receptor = Resena::where('id_Servicio', $solicitud->id_Servicio)
                ->where('id_CorreoUsuario', $user->id_CorreoUsuario)
                ->where('id_Postulacion', $solicitud->id)
                ->exists();

            return $solicitud;
        });

        return response()->json(['solicitudes' => $solicitudes]);
    }

    /**
     * Priorizar o actualizar estado de una solicitud recibida por el dueno del servicio.
     */
    public function actualizarEstadoSolicitud(Request $request, $id)
    {
        $user = $request->user();
        if (! $user) {
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

        if (! $postulacion) {
            return response()->json(['message' => 'Solicitud no encontrada o no autorizada.'], 404);
        }

        $postulacion->estado = $validated['estado'];
        $postulacion->save();

        Notificacion::create([
            'mensaje' => 'Tu solicitud para "'.($postulacion->servicio->titulo ?? 'servicio').'" ahora esta '.$validated['estado'].'.',
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
     * El cliente (quien paga) marca el trabajo como completado.
     * Solo se puede marcar como completado si el estado actual es 'en_progreso'.
     *
     * FLUJO A (postulante): el cliente (id_Cliente del servicio) marca completado
     * FLUJO B (solicitante): el cliente (id_Usuario de la postulación) marca completado
     *
     * Cuando todas las postulaciones del servicio están finalizadas, el servicio se marca como Completado.
     */
    public function marcarCompletado(Request $request, $id)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Buscar la postulación con su servicio
        $postulacion = Postulacion::with(['servicio'])
            ->where('id', $id)
            ->first();

        if (! $postulacion) {
            return response()->json(['message' => 'Solicitud no encontrada.'], 404);
        }

        // Determinar quién es el cliente (quien paga) según el tipo de flujo
        // FLUJO A (postulante): el cliente es id_Cliente del servicio
        // FLUJO B (solicitante): el cliente es id_Usuario de la postulación
        $esFlujoPosta = $postulacion->tipo_postulacion === 'postulante';
        $emailClienteQuePaga = $esFlujoPosta
            ? $postulacion->servicio?->id_Cliente   // FLUJO A: dueño de la oportunidad
            : $postulacion->id_Usuario;             // FLUJO B: quien solicitó el servicio

        // Solo el cliente (quien paga) puede marcar como completado
        if ($user->id_CorreoUsuario !== $emailClienteQuePaga) {
            return response()->json(['message' => 'No autorizado para marcar este trabajo como completado.'], 403);
        }

        if ($postulacion->estado !== 'en_progreso') {
            return response()->json(['message' => 'Solo se puede marcar como completado un trabajo en progreso.'], 422);
        }

        $postulacion->estado = 'completada';
        $postulacion->save();

        // Actualizar estado del servicio si no hay postulaciones activas restantes
        $servicio = $postulacion->servicio;
        if ($servicio) {
            $postulacionesRestantes = Postulacion::where('id_Servicio', $servicio->id_Servicio)
                ->where('id', '!=', $postulacion->id)
                ->whereNotIn('estado', ['completada', 'pagada', 'rechazada', 'cancelada'])
                ->count();

            if ($postulacionesRestantes === 0) {
                $servicio->estado = 'Completado';
                $servicio->save();
            }
        }

        // Notificar al OFERTANTE (quien ejecutó el trabajo) que el trabajo fue aceptado
        // FLUJO A: ofertante = id_Usuario / FLUJO B: ofertante = id_Cliente del servicio
        $emailOfertante = $esFlujoPosta
            ? $postulacion->id_Usuario
            : $postulacion->servicio?->id_Cliente;

        Notificacion::create([
            'mensaje' => 'El trabajo para "'.($postulacion->servicio->titulo ?? 'servicio').'" ha sido marcado como completado. El cliente procederá con el pago.',
            'estado' => 'No leido',
            'tipo' => 'postulacion',
            'id_CorreoUsuario' => $emailOfertante,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trabajo marcado como completado.',
            'postulacion' => $postulacion,
        ]);
    }

    /**
     * El ofertante cobra el pago después de que el cliente pagó.
     * Solo puede cobrar si la postulación está completada y ya existe un pago registrado.
     */
    public function cobrar(Request $request, $id)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $postulacion = Postulacion::with(['servicio'])
            ->where('id', $id)
            ->where('id_Usuario', $user->id_CorreoUsuario)
            ->first();

        if (! $postulacion) {
            return response()->json(['message' => 'Solicitud no encontrada o no autorizada.'], 404);
        }

        if ($postulacion->estado !== 'completada') {
            return response()->json(['message' => 'Solo se puede cobrar un trabajo completado.'], 422);
        }

        // Verificar si ya existe un pago para esta postulación
        $pago = \App\Models\PagoServicio::where('id_Postulacion', $id)
            ->where('estado', 'Completado')
            ->first();

        if (! $pago) {
            return response()->json([
                'message' => 'No se puede cobrar. El cliente aún no ha realizado el pago.',
            ], 422);
        }

        // Actualizar el estado de la postulación a 'pagada'
        $postulacion->estado = 'pagada';
        $postulacion->save();

        Notificacion::create([
            'mensaje' => 'Has cobrado el pago para "'.($postulacion->servicio->titulo ?? 'servicio').'". Gracias por tu trabajo.',
            'estado' => 'No leido',
            'tipo' => 'postulacion',
            'id_CorreoUsuario' => $user->id_CorreoUsuario,
        ]);

        // Notificar al cliente
        Notificacion::create([
            'mensaje' => 'El proveedor ha cobrado el pago para "'.($postulacion->servicio->titulo ?? 'servicio').'". Ya puedes dejar una calificación.',
            'estado' => 'No leido',
            'tipo' => 'postulacion',
            'id_CorreoUsuario' => $postulacion->servicio->id_Cliente,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pago cobrado exitosamente.',
            'postulacion' => $postulacion,
            'pago' => $pago,
        ]);
    }

    /**
     * Verificar si una postulación está lista para pago.
     * Retorna true solo si el estado es 'completada'.
     */
    public function verificarListoParaPago(Request $request, $id)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $postulacion = Postulacion::with(['servicio', 'usuario'])
            ->where('id', $id)
            ->first();

        if (! $postulacion) {
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
        /** @var Usuario $user */
        $user = Auth::user();
        if ($user->bloqueado) {
            return response()->json(['message' => 'Tu cuenta esta bloqueada.'], 403);
        }

        $request->validate([
            'id_Servicio' => 'required|exists:servicios,id_Servicio',
            'mensaje' => 'required|string',
            'presupuesto' => 'nullable|numeric',
            'tiempo_estimado' => 'nullable|string',
            'tipo_postulacion' => 'nullable|in:postulante,solicitante',
        ]);

        // Determinar el tipo de postulación:
        // - 'postulante': el usuario aplica a una oportunidad (el cliente paga al postulante)
        // - 'solicitante': el usuario solicita un servicio a un ofertante (el solicitante paga al proveedor)
        // Si no se especifica, se determina automáticamente según el tipo de servicio
        $tipoPostulacion = $request->tipo_postulacion;

        if (! $tipoPostulacion) {
            $servicio = Servicio::find($request->id_Servicio);
            // Determinar el tipo según el tipo del servicio:
            // - 'oportunidad': el usuario aplica a una necesidad publicada → es 'postulante'
            //   (el dueño de la oportunidad pagará al postulante seleccionado)
            // - 'servicio': el usuario solicita un servicio ofertado → es 'solicitante'
            //   (el solicitante pagará al proveedor del servicio)
            $tipoPostulacion = ($servicio && $servicio->tipo === 'oportunidad')
                ? 'postulante'
                : 'solicitante';
        }

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
            'estado' => 'pendiente',
            'tipo_postulacion' => $tipoPostulacion,
        ]);

        // Conversión de rol: Cliente → Ofertante al postulan (una vez ofertante, permanece permanentemente)
        if ($user->rol === 'cliente') {
            $user->rol = 'ofertante';
            $user->save();
        }

        $servicio = Servicio::find($request->id_Servicio);
        if ($servicio) {
            Notificacion::create([
                'mensaje' => 'Nueva postulacion para tu servicio "'.$servicio->titulo.'".',
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
        /** @var Usuario $user */
        $user = Auth::user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $postulacion = Postulacion::where('id', $id)
            ->where('id_Usuario', $user->id_CorreoUsuario)
            ->with('servicio')
            ->first();

        if (! $postulacion) {
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
                'mensaje' => 'Una postulacion fue actualizada en tu servicio "'.$postulacion->servicio->titulo.'".',
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
        /** @var Usuario $user */
        $user = Auth::user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $postulacion = Postulacion::where('id', $id)
            ->where('id_Usuario', $user->id_CorreoUsuario)
            ->with('servicio')
            ->first();

        if (! $postulacion) {
            return response()->json(['message' => 'Postulacion no encontrada.'], 404);
        }

        if ($postulacion->estado === 'cancelada') {
            return response()->json(['message' => 'La postulacion ya esta cancelada.'], 422);
        }

        $postulacion->estado = 'cancelada';
        $postulacion->save();

        if ($postulacion->servicio) {
            Notificacion::create([
                'mensaje' => 'Una postulacion fue cancelada en tu servicio "'.$postulacion->servicio->titulo.'".',
                'estado' => 'No leido',
                'tipo' => 'postulacion',
                'id_CorreoUsuario' => $postulacion->servicio->id_Cliente,
            ]);
        }

        $pendientesActivas = Postulacion::where('id_Usuario', $user->id_CorreoUsuario)
            ->whereIn('estado', ['pendiente', 'aceptada'])
            ->exists();

        // NOTA: Se eliminó la reversión automática de ofertante a cliente
        // Un usuario que se postula permanece con su rol actual
        // La transición de roles solo ocurre al crear servicios (ver ServicioController)

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
        if (! $admin || $admin->rol !== 'admin') {
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
        if (! $admin || $admin->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'estado' => 'required|in:pendiente,aceptada,rechazada,cancelada',
        ]);

        $postulacion = Postulacion::with('servicio')->findOrFail($id);
        $postulacion->estado = $validated['estado'];
        $postulacion->save();

        Notificacion::create([
            'mensaje' => 'Tu postulacion para "'.($postulacion->servicio->titulo ?? 'servicio').'" ahora esta '.$validated['estado'].'.',
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
