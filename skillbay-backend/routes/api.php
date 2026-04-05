<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthRecoveryController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\MensajeController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\PagoSimuladoController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\PostulacionController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\ResenaController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [UsuarioController::class, 'register']);
Route::post('/login', [UsuarioController::class, 'login']);
Route::post('/password/forgot', [AuthRecoveryController::class, 'solicitarRecuperacion']);
Route::post('/password/reset', [AuthRecoveryController::class, 'restablecerContrasena']);
Route::get('/usuarios', [UsuarioController::class, 'listar']);
Route::get('/planes', [PlanController::class, 'listar']);
Route::get('/planes/{id}', [PlanController::class, 'ver']);
Route::get('/servicios/public', [ServicioController::class, 'publicExplore']);
Route::get('/categorias/publicas', function () {
    $categorias = \App\Models\Categoria::orderBy('grupo')->orderBy('nombre')->get();
    $categorias->transform(function ($categoria) {
        if ($categoria->imagen) {
            if (str_starts_with($categoria->imagen, 'http://') || str_starts_with($categoria->imagen, 'https://')) {
                $categoria->imagen = $categoria->imagen;
            } else {
                $categoria->imagen = asset('storage/'.$categoria->imagen);
            }
        }

        return $categoria;
    });

    return $categorias;
});

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');

Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UsuarioController::class, 'me']);
    Route::put('/user', [UsuarioController::class, 'update']);
    Route::post('/user/imagen-perfil', [UsuarioController::class, 'uploadProfileImage']);
    Route::get('/user/metodos-pago', [UsuarioController::class, 'getMetodosPago']);
    Route::put('/user/metodos-pago', [UsuarioController::class, 'updateMetodosPago']);
    Route::post('/user/metodos-pago/qr', [UsuarioController::class, 'uploadQrPago']);
    Route::get('/usuarios/{id}/perfil', [UsuarioController::class, 'perfilPublico']);
    Route::get('/servicios/explore', [ServicioController::class, 'explore']);
    // Rutas específicas de solicitudes - deben estar ANTES de apiResource
    // Solicitudes recibidas
    Route::get('/servicios/solicitudes', [PostulacionController::class, 'solicitudesRecibidas']);
    Route::patch('/servicios/solicitudes/{id}/estado', [PostulacionController::class, 'actualizarEstadoSolicitud']);
    // Solicitudes enviadas
    Route::apiResource('servicios', ServicioController::class);
    Route::apiResource('postulaciones', PostulacionController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::patch('/postulaciones/{id}/completar', [PostulacionController::class, 'marcarCompletado']);
    Route::post('/postulaciones/{id}/cobrar', [PostulacionController::class, 'cobrar']);
    Route::get('/postulaciones/{id}/listo-pago', [PostulacionController::class, 'verificarListoParaPago']);
    Route::get('/categorias', function () {
        return \App\Models\Categoria::orderBy('grupo')->orderBy('nombre')->get();
    });
    Route::post('/pagos/plan', [PagoController::class, 'pagarPlan']);
    Route::post('/pagos/servicio', [PagoController::class, 'pagarServicio']);
    Route::get('/pagos/historial', [PagoController::class, 'historial']);
    Route::get('/pagos/historial/{tipo}/{id}', [PagoController::class, 'detalle']);

    // Pago simulado
    Route::get('/pagos/metodos', [PagoSimuladoController::class, 'metodosPago']);
    Route::post('/pagos/plan/simulado', [PagoSimuladoController::class, 'iniciarPagoPlan']);
    Route::post('/pagos/servicio/simulado', [PagoSimuladoController::class, 'iniciarPagoServicioDirecto']);
    Route::post('/pagos/servicio/simulado-postulacion', [PagoSimuladoController::class, 'iniciarPagoServicio']);
    Route::post('/pagos/procesar', [PagoSimuladoController::class, 'procesarPago']);
    Route::post('/pagos/aprobar-auto', [PagoSimuladoController::class, 'aprobarAutomatico']);
    Route::get('/pagos/estado', [PagoSimuladoController::class, 'obtenerEstado']);
    Route::post('/pagos/comprobante', [PagoSimuladoController::class, 'subirComprobante']);

    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::get('/notificaciones/resumen', [NotificacionController::class, 'resumen']);
    Route::patch('/notificaciones/{id}/leer', [NotificacionController::class, 'marcarLeida']);
    Route::patch('/notificaciones/marcar-todas-leidas', [NotificacionController::class, 'marcarTodasLeidas']);
    Route::delete('/notificaciones/{id}', [NotificacionController::class, 'eliminar']);
    Route::delete('/notificaciones', [NotificacionController::class, 'eliminarTodas']);

    Route::post('/reportes', [ReporteController::class, 'store']);

    // Rutas autenticadas para reseñas
    Route::post('/resenas', [ResenaController::class, 'store']);
    Route::get('/resenas/servicio/{id}', [ResenaController::class, 'porServicio']);
    Route::get('/resenas/usuario/{id}', [ResenaController::class, 'porUsuario']);
    Route::get('/resenas/usuario/{id}/hechas', [ResenaController::class, 'porUsuarioHechas']);
    Route::get('/resenas/usuario/{id}/promedio', [ResenaController::class, 'promedioPorUsuario']);

    Route::get('/mensajes/conversaciones', [MensajeController::class, 'conversaciones']);
    Route::get('/postulaciones/{idPostulacion}/mensajes', [MensajeController::class, 'index']);
    Route::post('/postulaciones/{idPostulacion}/mensajes', [MensajeController::class, 'store']);
    Route::delete('/mensajes/{idMensaje}', [MensajeController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'es.admin'])->group(function () {
    // Admin
    Route::get('/admin/resumen', [AdminController::class, 'resumen']);
    Route::get('/admin/metricas', [AdminController::class, 'metricas']);
    Route::get('/admin/analytics/top-ofertantes', [AdminController::class, 'topOfertantes']);
    Route::get('/admin/analytics/top-clientes', [AdminController::class, 'topClientes']);
    Route::get('/admin/analytics/top-servicios', [AdminController::class, 'topServicios']);
    Route::get('/admin/analytics/resenas-resumen', [AdminController::class, 'resenasResumen']);
    Route::get('/admin/usuarios', [UsuarioController::class, 'listarAdmin']);
    Route::patch('/admin/usuarios/{id}/bloqueo', [UsuarioController::class, 'cambiarBloqueo']);
    Route::patch('/admin/usuarios/{email}/bloquear', [UsuarioController::class, 'bloquearAdmin']);
    Route::delete('/admin/servicios/{id}', [ServicioController::class, 'destroyAdmin']);
    Route::get('/admin/servicios', [ServicioController::class, 'adminIndex']);
    Route::patch('/admin/servicios/{id}/estado', [ServicioController::class, 'cambiarEstadoAdmin']);

    Route::get('/admin/planes', [PlanController::class, 'listar']);
    Route::post('/admin/planes', [PlanController::class, 'crear']);
    Route::put('/admin/planes/{id}', [PlanController::class, 'actualizar']);
    Route::delete('/admin/planes/{id}', [PlanController::class, 'eliminar']);

    Route::get('/admin/postulaciones', [PostulacionController::class, 'adminIndex']);
    Route::patch('/admin/postulaciones/{id}/estado', [PostulacionController::class, 'cambiarEstado']);
    Route::get('/admin/reportes', [ReporteController::class, 'adminIndex']);
    Route::patch('/admin/reportes/{id}/estado', [ReporteController::class, 'cambiarEstado']);

    Route::get('/admin/categorias', [CategoriaController::class, 'listar']);
    Route::get('/admin/categorias/kpis', [CategoriaController::class, 'kpis']);
    Route::post('/admin/categorias', [CategoriaController::class, 'crear']);
    Route::put('/admin/categorias/{id}', [CategoriaController::class, 'actualizar']);
    Route::delete('/admin/categorias/{id}', [CategoriaController::class, 'eliminar']);

    Route::get('/admin/notificaciones', [NotificacionController::class, 'index']);
    Route::post('/admin/notificaciones/global', [NotificacionController::class, 'notificarATodos']);
});
