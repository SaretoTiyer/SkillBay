<?php 

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PlanController;
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
    Route::apiResource('servicios', \App\Http\Controllers\Api\ServicioController::class);
    Route::apiResource('postulaciones', \App\Http\Controllers\Api\PostulacionController::class)->only(['index', 'store']);
    Route::get('/categorias', function () {
        return \App\Models\Categoria::all();
    });
});
