<?php 

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\PostulacionController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\UsuarioController;



Route::post('/register', [UsuarioController::class, 'register']);
Route::post('/login', [UsuarioController::class, 'login']);
Route::get('/usuarios', [UsuarioController::class, 'listar']);
Route::get('/planes', [PlanController::class, 'listar']);
Route::get('/planes/{id}', [PlanController::class, 'ver']);

Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UsuarioController::class, 'me']);
    Route::put('/user', [UsuarioController::class, 'update']);
    Route::get('/servicios/explore', [ServicioController::class, 'explore']);
    Route::apiResource('servicios', ServicioController::class);
    Route::apiResource('postulaciones', PostulacionController::class)->only(['index', 'store']);
    Route::get('/categorias', function () {
        return \App\Models\Categoria::all();
    });

    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::patch('/notificaciones/{id}/leer', [NotificacionController::class, 'marcarLeida']);

    // Admin
    Route::get('/admin/resumen', [AdminController::class, 'resumen']);
    Route::get('/admin/usuarios', [UsuarioController::class, 'listarAdmin']);
    Route::patch('/admin/usuarios/{id}/bloqueo', [UsuarioController::class, 'cambiarBloqueo']);

    Route::get('/admin/planes', [PlanController::class, 'listar']);
    Route::post('/admin/planes', [PlanController::class, 'crear']);
    Route::put('/admin/planes/{id}', [PlanController::class, 'actualizar']);
    Route::delete('/admin/planes/{id}', [PlanController::class, 'eliminar']);

    Route::get('/admin/postulaciones', [PostulacionController::class, 'adminIndex']);
    Route::patch('/admin/postulaciones/{id}/estado', [PostulacionController::class, 'cambiarEstado']);

    Route::get('/admin/categorias', [CategoriaController::class, 'listar']);
    Route::post('/admin/categorias', [CategoriaController::class, 'crear']);
    Route::put('/admin/categorias/{id}', [CategoriaController::class, 'actualizar']);
    Route::delete('/admin/categorias/{id}', [CategoriaController::class, 'eliminar']);

    Route::get('/admin/notificaciones', [NotificacionController::class, 'index']);
    Route::post('/admin/notificaciones/global', [NotificacionController::class, 'notificarATodos']);
});
