<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mensaje;
use App\Models\Notificacion;
use App\Models\Postulacion;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MensajeController extends Controller
{
    private function limpiarMensajesExpirados(): void
    {
        Mensaje::whereNotNull('expiraEn')
            ->where('expiraEn', '<=', now())
            ->delete();

        // Si la postulacion ya esta terminada, los mensajes duran maximo 15 dias.
        Mensaje::whereHas('postulacion', function ($q) {
            $q->whereIn('estado', ['aceptada', 'rechazada']);
        })->where('created_at', '<=', now()->subDays(15))->delete();
    }

    private function validarAccesoPostulacion($user, Postulacion $postulacion): bool
    {
        $esPostulante = $postulacion->id_Usuario === $user->id_CorreoUsuario;
        $esDuenoServicio = $postulacion->servicio && $postulacion->servicio->id_Cliente === $user->id_CorreoUsuario;
        return $esPostulante || $esDuenoServicio || $user->rol === 'admin';
    }

    public function conversaciones(Request $request)
    {
        $this->limpiarMensajesExpirados();

        $user = $request->user();
        $postulaciones = Postulacion::with(['servicio:id_Servicio,titulo,id_Cliente', 'usuario:id_CorreoUsuario,nombre,apellido,ciudad'])
            ->select('id', 'id_Servicio', 'id_Usuario', 'mensaje', 'presupuesto', 'tiempo_estimado', 'estado', 'created_at', 'updated_at')
            ->where(function ($q) use ($user) {
                $q->where('id_Usuario', $user->id_CorreoUsuario)
                    ->orWhereHas('servicio', function ($s) use ($user) {
                        $s->where('id_Cliente', $user->id_CorreoUsuario);
                    });
            })
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'total' => $postulaciones->count(),
            'conversaciones' => $postulaciones,
        ]);
    }

    public function index(Request $request, $idPostulacion)
    {
        $this->limpiarMensajesExpirados();

        $user = $request->user();
        $postulacion = Postulacion::with('servicio')->findOrFail($idPostulacion);

        if (!$this->validarAccesoPostulacion($user, $postulacion)) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $mensajes = Mensaje::where('id_Postulacion', $idPostulacion)
            ->with('emisor:id_CorreoUsuario,nombre,apellido')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'total' => $mensajes->count(),
            'mensajes' => $mensajes,
            'postulacion' => $postulacion,
        ]);
    }

    public function store(Request $request, $idPostulacion)
    {
        $this->limpiarMensajesExpirados();

        $user = $request->user();
        $postulacion = Postulacion::with('servicio')->findOrFail($idPostulacion);

        if (!$this->validarAccesoPostulacion($user, $postulacion)) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'mensaje' => 'required|string|min:1|max:2000',
        ]);

        $expiraEn = null;
        if (in_array($postulacion->estado, ['aceptada', 'rechazada'], true)) {
            $expiraEn = Carbon::now()->addDays(15);
        }

        $nuevo = Mensaje::create([
            'id_Postulacion' => $postulacion->id,
            'id_Emisor' => $user->id_CorreoUsuario,
            'mensaje' => $validated['mensaje'],
            'expiraEn' => $expiraEn,
        ]);

        $destinatario = $postulacion->id_Usuario === $user->id_CorreoUsuario
            ? $postulacion->servicio?->id_Cliente
            : $postulacion->id_Usuario;

        if ($destinatario) {
            Notificacion::create([
                'mensaje' => 'Tienes un nuevo mensaje en la postulacion #' . $postulacion->id . '.',
                'estado' => 'No leido',
                'tipo' => 'postulacion',
                'id_CorreoUsuario' => $destinatario,
            ]);
        }

        return response()->json([
            'success' => true,
            'mensaje' => $nuevo->load('emisor:id_CorreoUsuario,nombre,apellido'),
        ], 201);
    }

    public function destroy(Request $request, $idMensaje)
    {
        $user = $request->user();
        $mensaje = Mensaje::with('postulacion.servicio')->findOrFail($idMensaje);

        if (!$this->validarAccesoPostulacion($user, $mensaje->postulacion)) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $mensaje->delete();
        return response()->json(['success' => true, 'message' => 'Mensaje eliminado.']);
    }
}
