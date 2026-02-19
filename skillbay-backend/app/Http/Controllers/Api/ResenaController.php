<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reseña;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ResenaController extends Controller
{
    /**
     * Crear una reseña para un servicio
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_Servicio' => 'required|exists:servicios,id_Servicio',
                'calificacion' => 'required|integer|min:1|max:5',
                'comentario' => 'nullable|string|max:1000',
                'metodoPago' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            // Obtener el usuario actual
            $user = $request->user();

            $resena = Reseña::create([
                'id_Servicio' => $data['id_Servicio'],
                'calificacion' => $data['calificacion'],
                'comentario' => $data['comentario'] ?? null,
                'metodoPago' => $data['metodoPago'] ?? null,
                'fechaReseña' => now(),
                'id_CorreoUsuario' => $user->id_CorreoUsuario,
            ]);

            return response()->json([
                'success' => true,
                'resena' => $resena,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la reseña',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener reseñas de un servicio
     */
    public function porServicio($id_Servicio)
    {
        try {
            $resenas = Reseña::where('id_Servicio', $id_Servicio)
                ->orderBy('fechaReseña', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'resenas' => $resenas,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las reseñas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
