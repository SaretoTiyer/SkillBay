<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Notificacion;
use App\Models\PagoPlan;
use App\Models\Plan;
use App\Models\Postulacion;
use App\Models\Reporte;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'reportesPendientes' => Reporte::where('estado', 'pendiente')->count(),
            'categorias' => Categoria::count(),
            'servicios' => Servicio::count(),
            'notificacionesPendientes' => Notificacion::where('estado', 'No leido')->count(),
            'ingresosPlanes' => (float) PagoPlan::sum('monto'),
        ];

        return response()->json([
            'success' => true,
            'resumen' => $data,
        ]);
    }

    public function metricas(Request $request)
    {
        $admin = $request->user();
        if (!$admin || $admin->rol !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado',
            ], 403);
        }

        $usuariosPorMes = Usuario::selectRaw("DATE_FORMAT(fechaRegistro, '%Y-%m') as mes, COUNT(*) as total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        $ingresosPorMes = PagoPlan::selectRaw("DATE_FORMAT(fechaPago, '%Y-%m') as mes, SUM(monto) as total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        return response()->json([
            'success' => true,
            'usuariosPorMes' => $usuariosPorMes,
            'ingresosPorMes' => $ingresosPorMes,
        ]);
    }
}
