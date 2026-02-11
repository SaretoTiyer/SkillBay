<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
        $request->validate([
            'id_Servicio' => 'required|exists:servicios,id_Servicio',
            'mensaje' => 'required|string',
            'presupuesto' => 'nullable|numeric',
            'tiempo_estimado' => 'nullable|string',
        ]);

        $user = Auth::user();

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

        return response()->json($postulacion, 201);
    }
}
