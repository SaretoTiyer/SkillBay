<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\Reporte;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'id_Reportado' => 'nullable|string|exists:usuarios,id_CorreoUsuario',
            'id_Servicio' => 'nullable|integer|exists:servicios,id_Servicio',
            'id_Postulacion' => 'nullable|integer|exists:postulaciones,id',
            'motivo' => 'required|string|min:10|max:2000',
        ]);

        $idReportado = $validated['id_Reportado'] ?? null;
        if (!$idReportado && !empty($validated['id_Servicio'])) {
            $servicio = Servicio::find($validated['id_Servicio']);
            $idReportado = $servicio?->id_Cliente;
        }

        if (!$idReportado) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo identificar al usuario reportado.',
            ], 422);
        }

        $reporte = Reporte::create([
            'id_Reportador' => $user->id_CorreoUsuario,
            'id_Reportado' => $idReportado,
            'id_Servicio' => $validated['id_Servicio'] ?? null,
            'id_Postulacion' => $validated['id_Postulacion'] ?? null,
            'motivo' => $validated['motivo'],
            'estado' => 'pendiente',
        ]);

        $admins = Usuario::where('rol', 'admin')->select('id_CorreoUsuario')->get();
        foreach ($admins as $admin) {
            Notificacion::create([
                'mensaje' => 'Nuevo reporte recibido contra ' . $idReportado . '.',
                'estado' => 'No leido',
                'tipo' => 'reporte',
                'id_CorreoUsuario' => $admin->id_CorreoUsuario,
            ]);
        }

        return response()->json([
            'success' => true,
            'reporte' => $reporte,
        ], 201);
    }

    public function adminIndex(Request $request)
    {
        $admin = $request->user();
        if (!$admin || $admin->rol !== 'admin') {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $query = Reporte::with([
            'reportador:id_CorreoUsuario,nombre,apellido',
            'reportado:id_CorreoUsuario,nombre,apellido',
            'servicio:id_Servicio,titulo',
            'postulacion:id,id_Servicio,id_Usuario,estado',
        ])->orderBy('created_at', 'desc');

        if ($request->filled('estado')) {
            $query->where('estado', $request->query('estado'));
        }

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($inner) use ($q) {
                $inner->where('motivo', 'like', "%{$q}%")
                    ->orWhere('id_Reportado', 'like', "%{$q}%")
                    ->orWhere('id_Reportador', 'like', "%{$q}%");
            });
        }

        $reportes = $query->get();
        return response()->json([
            'success' => true,
            'total' => $reportes->count(),
            'reportes' => $reportes,
        ]);
    }

    public function cambiarEstado(Request $request, $id)
    {
        $admin = $request->user();
        if (!$admin || $admin->rol !== 'admin') {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'estado' => 'required|in:pendiente,en_revision,resuelto,descartado',
        ]);

        $reporte = Reporte::findOrFail($id);
        $reporte->estado = $validated['estado'];
        $reporte->save();

        Notificacion::create([
            'mensaje' => 'Tu reporte fue actualizado a estado: ' . $validated['estado'] . '.',
            'estado' => 'No leido',
            'tipo' => 'reporte',
            'id_CorreoUsuario' => $reporte->id_Reportador,
        ]);

        return response()->json([
            'success' => true,
            'reporte' => $reporte,
        ]);
    }
}
