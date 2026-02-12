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
            ->with(['servicio', 'servicio.cliente_usuario' => function($query) {
                 $query->select('id_CorreoUsuario', 'nombre', 'apellido');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($postulaciones);
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
            'estado' => 'required|in:pendiente,aceptada,rechazada',
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
