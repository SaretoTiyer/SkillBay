<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Notificacion;
use App\Models\PagoPlan;
use App\Models\Plan;
use App\Models\Postulacion;
use App\Models\Reporte;
use App\Models\Resena;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function resumen(Request $request)
    {

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

        $usuariosPorMes = Usuario::selectRaw("DATE_FORMAT(fechaRegistro, '%Y-%m') as mes, COUNT(*) as total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        $ingresosPorMes = PagoPlan::selectRaw("DATE_FORMAT(fechaPago, '%Y-%m') as mes, SUM(monto) as total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        // Users this month
        $usuariosEsteMes = Usuario::whereMonth('fechaRegistro', now()->month)
            ->whereYear('fechaRegistro', now()->year)
            ->count();

        // Users by role
        $usuariosPorRol = Usuario::select('rol')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('rol')
            ->pluck('total', 'rol')
            ->toArray();

        // Services by type
        $serviciosPorTipo = Servicio::select('tipo')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('tipo')
            ->pluck('total', 'tipo')
            ->toArray();

        // Services by status
        $serviciosPorEstado = Servicio::select('estado')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->toArray();

        // Plan popularity (users per plan)
        $usuariosPorPlan = Usuario::select('id_Plan')
            ->selectRaw('COUNT(*) as total')
            ->whereNotNull('id_Plan')
            ->groupBy('id_Plan')
            ->pluck('total', 'id_Plan')
            ->toArray();

        // Top categories by service count
        $topCategorias = Servicio::select('categorias.nombre')
            ->join('categorias', 'servicios.id_Categoria', '=', 'categorias.id_Categoria')
            ->selectRaw('COUNT(servicios.id_Servicio) as total')
            ->groupBy('categorias.nombre')
            ->orderByDesc('total')
            ->limit(6)
            ->get()
            ->map(fn($item) => ['nombre' => $item->nombre, 'total' => $item->total])
            ->toArray();

        return response()->json([
            'success' => true,
            'usuariosPorMes' => $usuariosPorMes,
            'ingresosPorMes' => $ingresosPorMes,
            'usuariosEsteMes' => $usuariosEsteMes,
            'usuariosPorRol' => $usuariosPorRol,
            'serviciosPorTipo' => $serviciosPorTipo,
            'serviciosPorEstado' => $serviciosPorEstado,
            'usuariosPorPlan' => $usuariosPorPlan,
            'topCategorias' => $topCategorias,
        ]);
    }

    public function topOfertantes(Request $request)
    {
        $top = Resena::where('rol_calificado', 'ofertante')
            ->select('id_CorreoUsuario_Calificado')
            ->selectRaw('AVG(calificacion_usuario) as promedio')
            ->selectRaw('COUNT(*) as total_resenas')
            ->groupBy('id_CorreoUsuario_Calificado')
            ->orderByDesc('promedio')
            ->orderByDesc('total_resenas')
            ->limit(5)
            ->get();

        $results = $top->map(function ($item) {
            $usuario = Usuario::where('id_CorreoUsuario', $item->id_CorreoUsuario_Calificado)
                ->select('id_CorreoUsuario', 'nombre', 'apellido', 'imagen_perfil')
                ->first();
            return [
                'email' => $item->id_CorreoUsuario_Calificado,
                'nombre' => $usuario?->nombre ?? '',
                'apellido' => $usuario?->apellido ?? '',
                'imagen_perfil' => $usuario?->imagen_perfil
                    ? (str_starts_with($usuario->imagen_perfil, 'http') ? $usuario->imagen_perfil : asset('storage/'.$usuario->imagen_perfil))
                    : null,
                'promedio' => round($item->promedio, 1),
                'total_resenas' => $item->total_resenas,
            ];
        });

        return response()->json(['success' => true, 'top' => $results]);
    }

    public function topClientes(Request $request)
    {
        $top = Resena::where('rol_calificado', 'cliente')
            ->select('id_CorreoUsuario_Calificado')
            ->selectRaw('AVG(calificacion_usuario) as promedio')
            ->selectRaw('COUNT(*) as total_resenas')
            ->groupBy('id_CorreoUsuario_Calificado')
            ->orderByDesc('promedio')
            ->orderByDesc('total_resenas')
            ->limit(5)
            ->get();

        $results = $top->map(function ($item) {
            $usuario = Usuario::where('id_CorreoUsuario', $item->id_CorreoUsuario_Calificado)
                ->select('id_CorreoUsuario', 'nombre', 'apellido')
                ->first();
            return [
                'email' => $item->id_CorreoUsuario_Calificado,
                'nombre' => $usuario?->nombre ?? '',
                'apellido' => $usuario?->apellido ?? '',
                'promedio' => round($item->promedio, 1),
                'total_resenas' => $item->total_resenas,
            ];
        });

        return response()->json(['success' => true, 'top' => $results]);
    }

    public function topServicios(Request $request)
    {
        $top = Resena::whereNotNull('id_Servicio')
            ->where('calificacion_servicio', '>', 0)
            ->select('id_Servicio')
            ->selectRaw('AVG(calificacion_servicio) as promedio')
            ->selectRaw('COUNT(*) as total_resenas')
            ->groupBy('id_Servicio')
            ->orderByDesc('promedio')
            ->orderByDesc('total_resenas')
            ->limit(5)
            ->get();

        $results = $top->map(function ($item) {
            $servicio = Servicio::where('id_Servicio', $item->id_Servicio)
                ->select('id_Servicio', 'titulo', 'tipo', 'id_Dueno', 'imagen')
                ->first();
            return [
                'id' => $item->id_Servicio,
                'titulo' => $servicio?->titulo ?? '',
                'tipo' => $servicio?->tipo ?? '',
                'id_Dueno' => $servicio?->id_Dueno ?? '',
                'imagen' => $servicio?->imagen ? (str_starts_with($servicio->imagen, 'http') ? $servicio->imagen : asset('storage/'.$servicio->imagen)) : null,
                'promedio' => round($item->promedio, 1),
                'total_resenas' => $item->total_resenas,
            ];
        });

        return response()->json(['success' => true, 'top' => $results]);
    }

    public function resenasResumen(Request $request)
    {
        $total = Resena::count();
        $promedioGeneral = Resena::avg('calificacion_usuario') ?? 0;
        $comoOfertante = Resena::where('rol_calificado', 'ofertante')->avg('calificacion_usuario') ?? 0;
        $comoCliente = Resena::where('rol_calificado', 'cliente')->avg('calificacion_usuario') ?? 0;

        $resenasPorMes = Resena::selectRaw("DATE_FORMAT(resenas.created_at, '%Y-%m') as mes, COUNT(*) as total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->limit(12)
            ->get();

        return response()->json([
            'success' => true,
            'resumen' => [
                'total' => $total,
                'promedio_general' => round($promedioGeneral, 1),
                'como_ofertante' => round($comoOfertante, 1),
                'como_cliente' => round($comoCliente, 1),
                'por_mes' => $resenasPorMes,
            ],
        ]);
    }
}
