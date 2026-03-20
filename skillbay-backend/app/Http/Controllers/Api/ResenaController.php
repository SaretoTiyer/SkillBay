<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\PagoServicio;
use App\Models\Postulacion;
use App\Models\Resena;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Controlador de Reseñas
 * 
 * SISTEMA DE ROLES:
 * 
 * El OFERTANTE es quien PROPORCIONA el servicio:
 * - En 'servicio': id_Cliente es el OFERTANTE (ofrece el servicio)
 * - En 'oportunidad': El POSTULANTE es el OFERTANTE (hará el trabajo)
 * 
 * El CLIENTE es quien RECIBE/paga por el servicio:
 * - En 'servicio': El SOLICITANTE es el CLIENTE (paga al ofertante)
 * - En 'oportunidad': id_Cliente es el CLIENTE (creó la oportunidad, necesita servicio)
 * 
 * TABLA DE DIRECCIONES:
 * ┌─────────────────┬───────────────┬──────────────────────────────────────────────┐
 * │ Servicio.tipo    │ Usuario      │ Dirección                                  │
 * ├─────────────────┼───────────────┼──────────────────────────────────────────────┤
 * │ servicio        │ id_Cliente   │ 'ofertante_a_cliente' (reseña al cliente)  │
 * │ servicio        │ postulante   │ 'cliente_a_ofertante' (reseña al ofertante)│
 * │ oportunidad     │ id_Cliente  │ 'cliente_a_ofertante' (reseña al ofertante)│
 * │ oportunidad     │ postulante   │ 'ofertante_a_cliente' (reseña al cliente) │
 * └─────────────────┴───────────────┴──────────────────────────────────────────────┘
 */
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
                'id_Postulacion' => 'nullable|exists:postulaciones,id',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();
            $user = $request->user();
            $servicio = Servicio::find($data['id_Servicio']);

            /**
             * VERIFICACIÓN DE PARTICIPACIÓN
             * El usuario debe haber participado en el servicio para reseñar
             */
            $esDueno = ($servicio->id_Cliente === $user->id_CorreoUsuario);
            
            $tienePostulacion = Postulacion::where('id_Servicio', $data['id_Servicio'])
                ->where('id_Usuario', $user->id_CorreoUsuario)
                ->exists();

            $tienePagoCompletado = PagoServicio::where('id_Servicio', $data['id_Servicio'])
                ->where(function ($q) use ($user) {
                    $q->where('id_Pagador', $user->id_CorreoUsuario)
                        ->orWhere('id_Receptor', $user->id_CorreoUsuario);
                })
                ->where('estado', 'Completado')
                ->exists();

            if (!$esDueno && !$tienePostulacion && !$tienePagoCompletado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo puedes reseñar servicios en los que hayas participado.',
                ], 403);
            }

            /**
             * DETERMINACIÓN DE DIRECCIÓN
             * 
             * Lógica:
             * El usuario está reseñando como OFERTANTE cuando:
             * - Es 'servicio' Y el usuario ES el id_Cliente (el ofertante)
             * - Es 'oportunidad' Y el usuario NO es el id_Cliente (el postulante que hará el trabajo)
             * 
             * El usuario está reseñando como CLIENTE cuando:
             * - Es 'servicio' Y el usuario NO es el id_Cliente (el solicitante que paga)
             * - Es 'oportunidad' Y el usuario ES el id_Cliente (el cliente que necesita servicio)
             */
            $isOfertanteReview = ($servicio->tipo === 'servicio' && $esDueno)
                || ($servicio->tipo === 'oportunidad' && !$esDueno);

            $direccion = $isOfertanteReview ? 'ofertante_a_cliente' : 'cliente_a_ofertante';

            /**
             * VERIFICACIÓN ANTI-DUPLICADOS
             * Un usuario solo puede reseñar una vez en cada dirección por servicio
             */
            $yaReseño = Resena::where('id_Servicio', $data['id_Servicio'])
                ->where('id_CorreoUsuario', $user->id_CorreoUsuario)
                ->where('direccion', $direccion)
                ->exists();

            if ($yaReseño) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya has dejado una reseña para este servicio.',
                ], 403);
            }

            /**
             * CREACIÓN DE LA RESEÑA
             */
            $resena = Resena::create([
                'id_Servicio' => $data['id_Servicio'],
                'calificacion' => $data['calificacion'],
                'comentario' => $data['comentario'] ?? null,
                'id_CorreoUsuario' => $user->id_CorreoUsuario,
                'direccion' => $direccion,
                'id_Postulacion' => $data['id_Postulacion'] ?? null,
            ]);

            /**
             * NOTIFICACIONES
             * Notificar a quien RECIBE la reseña
             */
            $nombreCalificador = $user->nombre ?? 'Un usuario';
            $servicioTitulo = $servicio->titulo ?? 'un servicio';
            $mensajeNotificacion = "{$nombreCalificador} te ha dejado {$data['calificacion']}/5 estrellas en '{$servicioTitulo}'";

            $idUsuarioNotificar = null;

            if ($direccion === 'ofertante_a_cliente') {
                /**
                 * El OFERTANTE reseña al CLIENTE
                 * Notificar al CLIENTE:
                 * - En 'servicio': el cliente es el postulante (solicitante)
                 * - En 'oportunidad': el cliente es el id_Cliente
                 */
                if ($servicio->tipo === 'oportunidad') {
                    $idUsuarioNotificar = $servicio->id_Cliente;
                } else {
                    if (!empty($data['id_Postulacion'])) {
                        $postulacion = Postulacion::where('id', $data['id_Postulacion'])->first();
                        if ($postulacion) {
                            $idUsuarioNotificar = $postulacion->id_Usuario;
                        }
                    }
                    if (!$idUsuarioNotificar) {
                        $postulacionReciente = Postulacion::where('id_Servicio', $data['id_Servicio'])
                            ->orderBy('created_at', 'desc')
                            ->first();
                        if ($postulacionReciente) {
                            $idUsuarioNotificar = $postulacionReciente->id_Usuario;
                        }
                    }
                }
            } else {
                /**
                 * El CLIENTE reseña al OFERTANTE
                 * Notificar al OFERTANTE:
                 * - En 'servicio': el ofertante es el id_Cliente
                 * - En 'oportunidad': el ofertante es el postulante
                 */
                if ($servicio->tipo === 'servicio') {
                    $idUsuarioNotificar = $servicio->id_Cliente;
                } else {
                    if (!empty($data['id_Postulacion'])) {
                        $postulacion = Postulacion::where('id', $data['id_Postulacion'])->first();
                        if ($postulacion) {
                            $idUsuarioNotificar = $postulacion->id_Usuario;
                        }
                    }
                    if (!$idUsuarioNotificar) {
                        $postulacionReciente = Postulacion::where('id_Servicio', $data['id_Servicio'])
                            ->orderBy('created_at', 'desc')
                            ->first();
                        if ($postulacionReciente) {
                            $idUsuarioNotificar = $postulacionReciente->id_Usuario;
                        }
                    }
                }
            }

            if ($idUsuarioNotificar && $idUsuarioNotificar !== $user->id_CorreoUsuario) {
                try {
                    Notificacion::create([
                        'mensaje' => $mensajeNotificacion,
                        'estado' => 'No leido',
                        'tipo' => 'resena',
                        'id_CorreoUsuario' => $idUsuarioNotificar,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Error creando notificación de reseña: ' . $e->getMessage());
                }
            }

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
                ->orderBy('created_at', 'desc')
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
     * Obtener reseñas que ha RECIBIDO un usuario
     * 
     * Lógica para categorizar reseñas:
     * 
     * Reseñas como OFERTANTE (usuario recibió reseña por PROPORCIONAR servicio):
     * - De 'servicio': direccion = 'cliente_a_ofertante' AND usuario = id_Cliente
     * - De 'oportunidad': direccion = 'ofertante_a_cliente' AND usuario = id_Usuario de postulacion
     * 
     * Reseñas como CLIENTE (usuario recibió reseña por RECIBIR/pagar servicio):
     * - De 'servicio': direccion = 'ofertante_a_cliente' AND usuario = id_Usuario de postulacion
     * - De 'oportunidad': direccion = 'cliente_a_ofertante' AND usuario = id_Cliente
     */
    public function porUsuario($id_CorreoUsuario)
    {
        try {
            /**
             * Reseñas RECIBIDAS como OFERTANTE
             */
            $resenasComoOfertante = Resena::where(function ($query) use ($id_CorreoUsuario) {
                    $query->whereHas('servicio', function ($q) use ($id_CorreoUsuario) {
                            $q->where('id_Cliente', $id_CorreoUsuario)
                              ->where('tipo', 'servicio');
                        })
                        ->where('direccion', 'cliente_a_ofertante');
                })
                ->orWhere(function ($query) use ($id_CorreoUsuario) {
                    $query->where('direccion', 'ofertante_a_cliente')
                        ->whereHas('postulacion', function ($q) use ($id_CorreoUsuario) {
                            $q->where('id_Usuario', $id_CorreoUsuario);
                        });
                })
                ->with(['servicio:id_Servicio,titulo,tipo', 'usuario:id_CorreoUsuario,nombre,apellido'])
                ->orderBy('created_at', 'desc')
                ->get();

            /**
             * Reseñas RECIBIDAS como CLIENTE
             */
            $resenasComoCliente = Resena::where(function ($query) use ($id_CorreoUsuario) {
                    $query->where('direccion', 'ofertante_a_cliente')
                        ->whereHas('postulacion', function ($q) use ($id_CorreoUsuario) {
                            $q->where('id_Usuario', $id_CorreoUsuario);
                        })
                        ->whereHas('servicio', function ($q) {
                            $q->where('tipo', 'servicio');
                        });
                })
                ->orWhere(function ($query) use ($id_CorreoUsuario) {
                    $query->whereHas('servicio', function ($q) use ($id_CorreoUsuario) {
                            $q->where('id_Cliente', $id_CorreoUsuario)
                              ->where('tipo', 'oportunidad');
                        })
                        ->where('direccion', 'cliente_a_ofertante');
                })
                ->with(['servicio:id_Servicio,titulo,tipo', 'usuario:id_CorreoUsuario,nombre,apellido'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'resenas' => $resenasComoOfertante,
                'resenas_como_ofertante' => $resenasComoOfertante,
                'resenas_como_cliente' => $resenasComoCliente,
                'total_ofertante' => $resenasComoOfertante->count(),
                'total_cliente' => $resenasComoCliente->count(),
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
     * Obtener reseñas que un usuario ha HECHO
     */
    public function porUsuarioHechas($id_CorreoUsuario)
    {
        try {
            $resenasHechas = Resena::where('id_CorreoUsuario', $id_CorreoUsuario)
                ->with(['servicio:id_Servicio,titulo,tipo'])
                ->orderBy('created_at', 'desc')
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
            $promedioOfertante = Resena::where(function ($query) use ($id_CorreoUsuario) {
                    $query->whereHas('servicio', function ($q) use ($id_CorreoUsuario) {
                            $q->where('id_Cliente', $id_CorreoUsuario)
                              ->where('tipo', 'servicio');
                        })
                        ->where('direccion', 'cliente_a_ofertante');
                })
                ->orWhere(function ($query) use ($id_CorreoUsuario) {
                    $query->where('direccion', 'ofertante_a_cliente')
                        ->whereHas('postulacion', function ($q) use ($id_CorreoUsuario) {
                            $q->where('id_Usuario', $id_CorreoUsuario);
                        });
                })
                ->avg('calificacion');

            $promedioCliente = Resena::where(function ($query) use ($id_CorreoUsuario) {
                    $query->where('direccion', 'ofertante_a_cliente')
                        ->whereHas('postulacion', function ($q) use ($id_CorreoUsuario) {
                            $q->where('id_Usuario', $id_CorreoUsuario);
                        })
                        ->whereHas('servicio', function ($q) {
                            $q->where('tipo', 'servicio');
                        });
                })
                ->orWhere(function ($query) use ($id_CorreoUsuario) {
                    $query->whereHas('servicio', function ($q) use ($id_CorreoUsuario) {
                            $q->where('id_Cliente', $id_CorreoUsuario)
                              ->where('tipo', 'oportunidad');
                        })
                        ->where('direccion', 'cliente_a_ofertante');
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
