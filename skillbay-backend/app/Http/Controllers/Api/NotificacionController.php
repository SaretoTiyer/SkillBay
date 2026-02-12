<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\Usuario;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 401);
        }

        if ($user->rol === 'admin' && $request->query('scope') === 'all') {
            $notificaciones = Notificacion::orderBy('created_at', 'desc')->limit(100)->get();
        } else {
            $notificaciones = Notificacion::where('id_CorreoUsuario', $user->id_CorreoUsuario)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();
        }

        return response()->json([
            'success' => true,
            'total' => $notificaciones->count(),
            'notificaciones' => $notificaciones,
        ]);
    }

    public function marcarLeida(Request $request, $id)
    {
        $user = $request->user();
        $notificacion = Notificacion::findOrFail($id);

        if ($user->rol !== 'admin' && $notificacion->id_CorreoUsuario !== $user->id_CorreoUsuario) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $notificacion->estado = 'Leido';
        $notificacion->save();

        return response()->json(['success' => true, 'notificacion' => $notificacion]);
    }

    public function notificarATodos(Request $request)
    {
        $admin = $request->user();
        if (!$admin || $admin->rol !== 'admin') {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'mensaje' => 'required|string|max:500',
            'tipo' => 'nullable|string|max:50',
        ]);

        $usuarios = Usuario::select('id_CorreoUsuario')->get();
        foreach ($usuarios as $usuario) {
            Notificacion::create([
                'mensaje' => $validated['mensaje'],
                'estado' => 'No leido',
                'tipo' => $validated['tipo'] ?? 'general',
                'id_CorreoUsuario' => $usuario->id_CorreoUsuario,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notificacion enviada a todos los usuarios.',
        ]);
    }
}
