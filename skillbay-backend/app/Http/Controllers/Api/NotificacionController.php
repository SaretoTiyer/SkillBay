<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\Usuario;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    private function mapearSeccion(string $tipo): string
    {
        return match ($tipo) {
            'postulacion' => 'postulacion',
            'reporte' => 'reporte',
            'servicio' => 'servicio',
            default => 'sistema',
        };
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 401);
        }

        $query = Notificacion::query();

        if ($user->rol === 'admin' && $request->query('scope') === 'all') {
            $query->orderBy('created_at', 'desc');
        } else {
            $query->where('id_CorreoUsuario', $user->id_CorreoUsuario)
                ->orderBy('created_at', 'desc');
        }

        if ($request->filled('seccion')) {
            $seccion = $request->query('seccion');
            $tipos = match ($seccion) {
                'postulacion' => ['postulacion'],
                'reporte' => ['reporte'],
                'servicio' => ['servicio'],
                default => ['sistema', 'plan', 'cuenta', 'general', 'admin'],
            };
            $query->whereIn('tipo', $tipos);
        }

        $notificaciones = $query->limit(150)->get()->map(function ($item) {
            $item->seccion = $this->mapearSeccion((string) ($item->tipo ?? 'sistema'));
            return $item;
        });

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

    public function marcarTodasLeidas(Request $request)
    {
        $user = $request->user();
        $query = Notificacion::query();

        if ($user->rol !== 'admin' || $request->query('scope') !== 'all') {
            $query->where('id_CorreoUsuario', $user->id_CorreoUsuario);
        }

        if ($request->filled('seccion')) {
            $seccion = $request->query('seccion');
            $tipos = match ($seccion) {
                'postulacion' => ['postulacion'],
                'reporte' => ['reporte'],
                'servicio' => ['servicio'],
                default => ['sistema', 'plan', 'cuenta', 'general', 'admin'],
            };
            $query->whereIn('tipo', $tipos);
        }

        $query->update(['estado' => 'Leido']);

        return response()->json(['success' => true, 'message' => 'Notificaciones marcadas como leidas.']);
    }

    public function eliminar(Request $request, $id)
    {
        $user = $request->user();
        $notificacion = Notificacion::findOrFail($id);

        if ($user->rol !== 'admin' && $notificacion->id_CorreoUsuario !== $user->id_CorreoUsuario) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $notificacion->delete();
        return response()->json(['success' => true, 'message' => 'Notificacion eliminada.']);
    }

    public function eliminarTodas(Request $request)
    {
        $user = $request->user();
        $query = Notificacion::query();

        if ($user->rol !== 'admin' || $request->query('scope') !== 'all') {
            $query->where('id_CorreoUsuario', $user->id_CorreoUsuario);
        }

        if ($request->filled('seccion')) {
            $seccion = $request->query('seccion');
            $tipos = match ($seccion) {
                'postulacion' => ['postulacion'],
                'reporte' => ['reporte'],
                'servicio' => ['servicio'],
                default => ['sistema', 'plan', 'cuenta', 'general', 'admin'],
            };
            $query->whereIn('tipo', $tipos);
        }

        $query->delete();
        return response()->json(['success' => true, 'message' => 'Notificaciones eliminadas.']);
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
                'tipo' => $validated['tipo'] ?? 'admin',
                'id_CorreoUsuario' => $usuario->id_CorreoUsuario,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notificacion enviada a todos los usuarios.',
        ]);
    }
}
