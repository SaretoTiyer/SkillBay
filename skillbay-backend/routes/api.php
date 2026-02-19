<?php 

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthRecoveryController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\MensajeController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\PostulacionController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\UsuarioController;



Route::post('/register', [UsuarioController::class, 'register']);
Route::post('/login', [UsuarioController::class, 'login']);
Route::post('/password/forgot', [AuthRecoveryController::class, 'solicitarRecuperacion']);
Route::post('/password/reset', [AuthRecoveryController::class, 'restablecerContrasena']);
Route::get('/usuarios', [UsuarioController::class, 'listar']);
Route::get('/planes', [PlanController::class, 'listar']);
Route::get('/planes/{id}', [PlanController::class, 'ver']);
Route::get('/servicios/public', [ServicioController::class, 'publicExplore']);
Route::get('/categorias/publicas', function () {
    return \App\Models\Categoria::orderBy('grupo')->orderBy('nombre')->get();
});

Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UsuarioController::class, 'me']);
    Route::put('/user', [UsuarioController::class, 'update']);
    Route::get('/usuarios/{id}/perfil', [UsuarioController::class, 'perfilPublico']);
    Route::get('/servicios/explore', [ServicioController::class, 'explore']);
    Route::apiResource('servicios', ServicioController::class);
    Route::apiResource('postulaciones', PostulacionController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('/servicios/solicitudes', [PostulacionController::class, 'solicitudesRecibidas']);
    Route::patch('/servicios/solicitudes/{id}/estado', [PostulacionController::class, 'actualizarEstadoSolicitud']);
    Route::get('/categorias', function () {
        return \App\Models\Categoria::orderBy('grupo')->orderBy('nombre')->get();
    });
    Route::post('/pagos/plan', [PagoController::class, 'pagarPlan']);
    Route::post('/pagos/servicio', [PagoController::class, 'pagarServicio']);
    Route::get('/pagos/historial', [PagoController::class, 'historial']);

    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::get('/notificaciones/resumen', [NotificacionController::class, 'resumen']);
    Route::patch('/notificaciones/{id}/leer', [NotificacionController::class, 'marcarLeida']);
    Route::patch('/notificaciones/marcar-todas-leidas', [NotificacionController::class, 'marcarTodasLeidas']);
    Route::delete('/notificaciones/{id}', [NotificacionController::class, 'eliminar']);
    Route::delete('/notificaciones', [NotificacionController::class, 'eliminarTodas']);

    Route::post('/reportes', [ReporteController::class, 'store']);

    Route::get('/mensajes/conversaciones', [MensajeController::class, 'conversaciones']);
    Route::get('/postulaciones/{idPostulacion}/mensajes', [MensajeController::class, 'index']);
    Route::post('/postulaciones/{idPostulacion}/mensajes', [MensajeController::class, 'store']);
    Route::delete('/mensajes/{idMensaje}', [MensajeController::class, 'destroy']);

    // Admin
    Route::get('/admin/resumen', [AdminController::class, 'resumen']);
    Route::get('/admin/metricas', [AdminController::class, 'metricas']);
    Route::get('/admin/usuarios', [UsuarioController::class, 'listarAdmin']);
    Route::patch('/admin/usuarios/{id}/bloqueo', [UsuarioController::class, 'cambiarBloqueo']);

    Route::get('/admin/planes', [PlanController::class, 'listar']);
    Route::post('/admin/planes', [PlanController::class, 'crear']);
    Route::put('/admin/planes/{id}', [PlanController::class, 'actualizar']);
    Route::delete('/admin/planes/{id}', [PlanController::class, 'eliminar']);

    Route::get('/admin/postulaciones', [PostulacionController::class, 'adminIndex']);
    Route::patch('/admin/postulaciones/{id}/estado', [PostulacionController::class, 'cambiarEstado']);
    Route::get('/admin/reportes', [ReporteController::class, 'adminIndex']);
    Route::patch('/admin/reportes/{id}/estado', [ReporteController::class, 'cambiarEstado']);

    Route::get('/admin/categorias', [CategoriaController::class, 'listar']);
    Route::post('/admin/categorias', [CategoriaController::class, 'crear']);
    Route::put('/admin/categorias/{id}', [CategoriaController::class, 'actualizar']);
    Route::delete('/admin/categorias/{id}', [CategoriaController::class, 'eliminar']);

    Route::get('/admin/notificaciones', [NotificacionController::class, 'index']);
    Route::post('/admin/notificaciones/global', [NotificacionController::class, 'notificarATodos']);
});
