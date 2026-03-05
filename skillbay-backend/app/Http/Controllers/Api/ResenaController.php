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
     * 
     * Sistema de reseñas bidireccionales:
     * - Cliente reseña al ofertante (cliente_a_ofertante)
     * - Ofertante reseña al cliente (ofertante_a_cliente)
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_Servicio' => 'required|exists:servicios,id_Servicio',
                'calificacion' => 'required|integer|min:1|max:5',
                'comentario' => 'nullable|string|max:1000',
                'metodoPago' => 'nullable|string|max:50',
                'direccion' => 'nullable|in:cliente_a_ofertante,ofertante_a_cliente',
                'id_Postulacion' => 'nullable|exists:postulacion,id',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            // Obtener el usuario actual
            $user = $request->user();
            $servicio = \App\Models\Servicio::find($data['id_Servicio']);
            
            // Determinar la dirección de la reseña si no se proporciona
            // Si el usuario es el cliente del servicio → está reseñando al ofertante
            // Si el usuario es quien hizo la postulación → está reseñando al cliente
            $direccion = $data['direccion'] ?? null;
            
            if (!$direccion) {
                if ($servicio->id_Cliente === $user->id_CorreoUsuario) {
                    // El cliente del servicio reseña al ofertante
                    $direccion = 'cliente_a_ofertante';
                } else {
                    // Quien se postuló reseña al cliente
                    $direccion = 'ofertante_a_cliente';
                }
            }

            $resena = Reseña::create([
                'id_Servicio' => $data['id_Servicio'],
                'calificacion' => $data['calificacion'],
                'comentario' => $data['comentario'] ?? null,
                'metodoPago' => $data['metodoPago'] ?? null,
                'fechaReseña' => now(),
                'id_CorreoUsuario' => $user->id_CorreoUsuario,
                'direccion' => $direccion,
                'id_Postulacion' => $data['id_Postulacion'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'resena' => $resena,
                'direccion' => $direccion,
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

    /**
     * Obtener reseñas de un usuario (reseñas que ha RECIBIDO)
     */
    public function porUsuario($id_CorreoUsuario)
    {
        try {
            // Obtener reseñas que el usuario ha RECIBIDO
            // Esto incluye:
            // 1. Reseñas de clientes hacia este usuario (como ofertante)
            // 2. Reseñas de ofertantes hacia este usuario (como cliente)
            $resenasRecibidas = Reseña::whereHas('servicio', function ($query) use ($id_CorreoUsuario) {
                    $query->where('id_Cliente', $id_CorreoUsuario);
                })
                ->where('direccion', 'ofertante_a_cliente')
                ->with(['servicio:id_Servicio,titulo', 'usuario:id_CorreoUsuario,nombre,apellido'])
                ->orderBy('fechaReseña', 'desc')
                ->get();

            // Reseñas que otros han hecho sobre servicios donde este usuario es el ofertante
            $resenasComoOfertante = Reseña::whereHas('servicio', function ($query) use ($id_CorreoUsuario) {
                    // Este usuario es el que ofrece el servicio
                })
                ->where('id_CorreoUsuario', '!=', $id_CorreoUsuario)
                ->where('direccion', 'cliente_a_ofertante')
                ->whereHas('servicio', function ($query) use ($id_CorreoUsuario) {
                    // Pero aquí el cliente es otro, no este usuario
                })
                ->with(['servicio:id_Servicio,titulo', 'usuario:id_CorreoUsuario,nombre,apellido'])
                ->orderBy('fechaReseña', 'desc')
                ->get();

            // Simplificado: Obtener reseñas donde el usuario fue reseñado
            // Busca reseñas dirigidas a este usuario (como cliente del servicio)
            $resenasRecibidas = Reseña::where('direccion', 'ofertante_a_cliente')
                ->whereHas('postulacion', function ($query) use ($id_CorreoUsuario) {
                    $query->where('id_Usuario', $id_CorreoUsuario);
                })
                ->with(['servicio:id_Servicio,titulo', 'usuario:id_CorreoUsuario,nombre,apellido'])
                ->orderBy('fechaReseña', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'resenas' => $resenasRecibidas,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las reseñas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener reseñas que un usuario ha HECHO (reseñas que ha escrito)
     */
    public function porUsuarioHechas($id_CorreoUsuario)
    {
        try {
            $resenasHechas = Reseña::where('id_CorreoUsuario', $id_CorreoUsuario)
                ->with(['servicio:id_Servicio,titulo'])
                ->orderBy('fechaReseña', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'resenas' => $resenasHechas,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las reseñas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener promedio de calificaciones de un usuario
     */
    public function promedioPorUsuario($id_CorreoUsuario)
    {
        try {
            // Calificaciones recibidas como ofertante
            $promedioOfertante = Reseña::where('direccion', 'cliente_a_ofertante')
                ->whereHas('servicio', function ($query) use ($id_CorreoUsuario) {
                    $query->where('id_Cliente', '!=', $id_CorreoUsuario);
                })
                ->avg('calificacion');

            // Calificaciones recibidas como cliente
            $promedioCliente = Reseña::where('direccion', 'ofertante_a_cliente')
                ->whereHas('postulacion', function ($query) use ($id_CorreoUsuario) {
                    $query->where('id_Usuario', $id_CorreoUsuario);
                })
                ->avg('calificacion');

            return response()->json([
                'success' => true,
                'promedio' => [
                    'como_ofertante' => round($promedioOfertante ?? 0, 1),
                    'como_cliente' => round($promedioCliente ?? 0, 1),
                    'general' => round((($promedioOfertante ?? 0) + ($promedioCliente ?? 0)) / 2, 1),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el promedio',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
