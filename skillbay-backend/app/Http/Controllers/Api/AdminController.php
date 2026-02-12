<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Notificacion;
use App\Models\Plan;
use App\Models\Postulacion;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function resumen(Request $request)
    {
        $admin = $request->user();
        if (!$admin || $admin->rol !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado',
            ], 403);
        }

        $data = [
            'usuarios' => Usuario::count(),
            'usuariosBloqueados' => Usuario::where('bloqueado', true)->count(),
            'planes' => Plan::count(),
            'postulaciones' => Postulacion::count(),
            'postulacionesPendientes' => Postulacion::where('estado', 'pendiente')->count(),
            'categorias' => Categoria::count(),
            'servicios' => Servicio::count(),
            'notificacionesPendientes' => Notificacion::where('estado', 'No leido')->count(),
        ];

        return response()->json([
            'success' => true,
            'resumen' => $data,
        ]);
    }
}
