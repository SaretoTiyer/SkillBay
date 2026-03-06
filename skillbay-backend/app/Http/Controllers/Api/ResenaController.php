<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resena;
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
                'id_Postulacion' => 'nullable|exists:postulaciones,id',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            // Obtener el usuario actual
            $user = $request->user();
            $servicio = \App\Models\Servicio::find($data['id_Servicio']);

            // Verificar que el usuario tiene una postulación pagada para este servicio
            $tienePago = \App\Models\PagoServicio::where('id_Servicio', $data['id_Servicio'])
                ->where(function ($q) use ($user) {
                    $q->where('id_Pagador', $user->id_CorreoUsuario)
                      ->orWhere('id_Receptor', $user->id_CorreoUsuario);
                })
                ->where('estado', 'Completado')
                ->exists();

            if (!$tienePago) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo puedes reseñar servicios en los que hayas participado y estén pagados.',
                ], 403);
            }

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

            $resena = Resena::create([
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
            $resenas = Resena::where('id_Servicio', $id_Servicio)
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
            // Reseñas recibidas COMO OFERTANTE:
            // El usuario es id_Usuario de la postulación y la dirección es cliente_a_ofertante
            $resenasComoOfertante = Resena::where('direccion', 'cliente_a_ofertante')
                ->whereHas('postulacion', function ($q) use ($id_CorreoUsuario) {
                    $q->where('id_Usuario', $id_CorreoUsuario);
                })
                ->with(['servicio:id_Servicio,titulo', 'usuario:id_CorreoUsuario,nombre,apellido'])
                ->orderBy('fechaResena', 'desc')
                ->get();

            // Reseñas recibidas COMO CLIENTE:
            // El usuario es id_Cliente del servicio y dirección es ofertante_a_cliente
            $resenasComoCliente = Resena::where('direccion', 'ofertante_a_cliente')
                ->whereHas('servicio', function ($q) use ($id_CorreoUsuario) {
                    $q->where('id_Cliente', $id_CorreoUsuario);
                })
                ->with(['servicio:id_Servicio,titulo', 'usuario:id_CorreoUsuario,nombre,apellido'])
                ->orderBy('fechaResena', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'resenas' => $resenasComoOfertante,        // Para compatibilidad con UserProfile.jsx
                'resenas_como_ofertante' => $resenasComoOfertante,
                'resenas_como_cliente'   => $resenasComoCliente,
                'total_ofertante' => $resenasComoOfertante->count(),
                'total_cliente'   => $resenasComoCliente->count(),
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
            $resenasHechas = Resena::where('id_CorreoUsuario', $id_CorreoUsuario)
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
            $promedioOfertante = Resena::where('direccion', 'cliente_a_ofertante')
                ->whereHas('postulacion', function ($q) use ($id_CorreoUsuario) {
                    $q->where('id_Usuario', $id_CorreoUsuario);
                })
                ->avg('calificacion');

            // Calificaciones recibidas como cliente
            $promedioCliente = Resena::where('direccion', 'ofertante_a_cliente')
                ->whereHas('servicio', function ($q) use ($id_CorreoUsuario) {
                    $q->where('id_Cliente', $id_CorreoUsuario);
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
