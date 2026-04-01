<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\PagoServicio;
use App\Models\Postulacion;
use App\Models\Resena;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Controlador de Reseñas (NUEVO MODELO)
 *
 * SISTEMA DE CALIFICACIONES:
 *
 * TIPO SERVICIO (Bidireccional):
 * - El CLIENTE (postulante) califica al OFERTANTE (id_Cliente)
 *   → calificacion_usuario = X
 *   → calificacion_servicio = Y (opcional)
 *
 * TIPO OPORTUNIDAD (Unilateral):
 * - El CLIENTE (id_Cliente) califica al OFERTANTE (postulante)
 *   → calificacion_usuario = X
 *   → calificacion_servicio = NULL
 *
 * ROLES:
 * - OFERTANTE: Quien PROPORCIONA el servicio
 *   * En 'servicio': id_Cliente es el OFERTANTE
 *   * En 'oportunidad': El POSTULANTE es el OFERTANTE
 *
 * - CLIENTE: Quien RECIBE/paga por el servicio
 *   * En 'servicio': El POSTULANTE es el CLIENTE
 *   * En 'oportunidad': id_Cliente es el CLIENTE
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
                'calificacion_usuario' => 'nullable|integer|min:1|max:5',
                'ratingUsuario' => 'nullable|integer|min:1|max:5',
                'calificacion_servicio' => 'nullable|integer|min:1|max:5',
                'ratingServicio' => 'nullable|integer|min:1|max:5',
                'comentario' => 'nullable|string|max:1000',
                'id_Postulacion' => 'nullable|exists:postulaciones,id',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            // Normalizar: aceptar ratingUsuario o calificacion_usuario
            $calificacionUsuario = $data['calificacion_usuario'] ?? $data['ratingUsuario'] ?? null;

            // Normalizar: aceptar ratingServicio o calificacion_servicio
            $calificacionServicio = $data['calificacion_servicio'] ?? $data['ratingServicio'] ?? null;

            // Validación: se requiere calificación al usuario
            if (empty($calificacionUsuario)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La calificación al ofertante es requerida.',
                ], 422);
            }

            $user = $request->user();
            $servicio = Servicio::find($data['id_Servicio']);

            /**
             * VERIFICACIÓN: Solo se puede calificar el SERVICIO en tipo='servicio'
             */
            if (! empty($data['calificacion_servicio']) && $servicio->tipo !== 'servicio') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo puedes calificar el servicio en tipo=servicio.',
                ], 422);
            }

            /**
             * VERIFICACIÓN DE PARTICIPACIÓN
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

            if (! $esDueno && ! $tienePostulacion && ! $tienePagoCompletado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo puedes reseñar servicios en los que hayas participado.',
                ], 403);
            }

            /**
             * VERIFICACIÓN ANTI-DUPLICADOS
             * Un usuario solo puede reseñar una vez por servicio
             */
            $yaReseño = Resena::where('id_Servicio', $data['id_Servicio'])
                ->where('id_CorreoUsuario', $user->id_CorreoUsuario)
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
            $id_CorreoUsuario_Calificado = $this->determinarCalificado($servicio, $data['id_Postulacion'] ?? null);
            $rolCalificado = $this->determinarRolCalificado($servicio, $user, $id_CorreoUsuario_Calificado);

            $resena = Resena::create([
                'id_Servicio' => $data['id_Servicio'],
                'calificacion_usuario' => $calificacionUsuario,
                'calificacion_servicio' => $calificacionServicio,
                'comentario' => $data['comentario'] ?? null,
                'id_CorreoUsuario' => $user->id_CorreoUsuario,
                'id_CorreoUsuario_Calificado' => $id_CorreoUsuario_Calificado,
                'rol_calificado' => $rolCalificado,
                'id_Postulacion' => $data['id_Postulacion'] ?? null,
            ]);

            /**
             * NOTIFICACIONES
             * El calificador SIEMPRE es el usuario actual (CLIENTE en este contexto)
             * El destinatario depende del tipo de servicio:
             * - En 'servicio': El OFERTANTE es id_Cliente
             * - En 'oportunidad': El OFERTANTE es el postulante
             */
            $nombreCalificador = $user->nombre ?? 'Un usuario';
            $servicioTitulo = $servicio->titulo ?? 'un servicio';
            $calificacion = $data['calificacion_usuario'];
            $mensajeNotificacion = "{$nombreCalificador} te ha dejado {$calificacion}/5 estrellas en '{$servicioTitulo}'";

            $idUsuarioNotificar = null;

            if ($servicio->tipo === 'servicio') {
                $idUsuarioNotificar = $servicio->id_Cliente;
            } else {
                if (! empty($data['id_Postulacion'])) {
                    $postulacion = Postulacion::where('id', $data['id_Postulacion'])->first();
                    if ($postulacion) {
                        $idUsuarioNotificar = $postulacion->id_Usuario;
                    }
                }
                if (! $idUsuarioNotificar) {
                    $postulacionReciente = Postulacion::where('id_Servicio', $data['id_Servicio'])
                        ->orderBy('created_at', 'desc')
                        ->first();
                    if ($postulacionReciente) {
                        $idUsuarioNotificar = $postulacionReciente->id_Usuario;
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
                    Log::error('Error creando notificación de reseña: '.$e->getMessage());
                }
            }

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
     * Lógica sin 'direccion':
     *
     * Reseñas como OFERTANTE (usuario recibió calificación por PROPORCIONAR servicio):
     * - El usuario ES el OFERTANTE y recibió una reseña de otra persona
     * - En 'servicio': El usuario es id_Cliente (ofertante) y fue calificado
     * - En 'oportunidad': El usuario es el postulante y fue calificado por id_Cliente
     *
     * Reseñas como CLIENTE (usuario recibió calificación por RECIBIR/pagar servicio):
     * - El usuario ES el CLIENTE y recibió una reseña de otra persona
     * - Solo aplica en 'servicio': El usuario es postulante y fue calificado por id_Cliente
     * - En 'oportunidad': El cliente (id_Cliente) no recibe reseñas como cliente
     */
    public function porUsuario($id_CorreoUsuario, Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 10);

            /**
             * Reseñas RECIBIDAS como OFERTANTE
             * El usuario fue criticado como OFERTANTE (prestó un servicio)
             * Ahora usamos rol_calificado explícito
             */
            $resenasComoOfertanteQuery = Resena::where('id_CorreoUsuario_Calificado', $id_CorreoUsuario)
                ->where('rol_calificado', 'ofertante')
                ->with(['servicio:id_Servicio,titulo,tipo', 'usuario:id_CorreoUsuario,nombre,apellido'])
                ->orderBy('created_at', 'desc');

            $resenasComoOfertante = $resenasComoOfertanteQuery->paginate($perPage, ['*'], 'page_ofertante', $page);

            /**
             * Reseñas RECIBIDAS como CLIENTE
             * El usuario fue criticado como CLIENTE (recibió un servicio)
             */
            $resenasComoClienteQuery = Resena::where('id_CorreoUsuario_Calificado', $id_CorreoUsuario)
                ->where('rol_calificado', 'cliente')
                ->with(['servicio:id_Servicio,titulo,tipo', 'usuario:id_CorreoUsuario,nombre,apellido'])
                ->orderBy('created_at', 'desc');

            $resenasComoCliente = $resenasComoClienteQuery->paginate($perPage, ['*'], 'page_cliente', $page);

            return response()->json([
                'success' => true,
                'resenas_como_ofertante' => $resenasComoOfertante->items(),
                'resenas_como_cliente' => $resenasComoCliente->items(),
                'total_ofertante' => $resenasComoOfertante->total(),
                'total_cliente' => $resenasComoCliente->total(),
                'meta' => [
                    'ofertante' => [
                        'current_page' => $resenasComoOfertante->currentPage(),
                        'per_page' => $resenasComoOfertante->perPage(),
                        'total' => $resenasComoOfertante->total(),
                        'last_page' => $resenasComoOfertante->lastPage(),
                    ],
                    'cliente' => [
                        'current_page' => $resenasComoCliente->currentPage(),
                        'per_page' => $resenasComoCliente->perPage(),
                        'total' => $resenasComoCliente->total(),
                        'last_page' => $resenasComoCliente->lastPage(),
                    ],
                ],
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
            /**
             * Promedio de calificaciones RECIBIDAS como OFERTANTE
             * El usuario fue calificado por otros (no por sí mismo) al proporcionar servicios/oportunidades
             */
            $resenasRecibidasOfertante = Resena::where('id_CorreoUsuario_Calificado', $id_CorreoUsuario)
                ->whereHas('servicio', function ($q) {
                    $q->where('tipo', 'oportunidad');
                });

            $promedioOfertanteUsuario = $resenasRecibidasOfertante->avg('calificacion_usuario') ?? 0;
            $countOfertante = $resenasRecibidasOfertante->count();

            /**
             * Promedio de calificaciones RECIBIDAS como CLIENTE
             * El usuario fue calificado por otros al recibir servicios
             */
            $resenasRecibidasCliente = Resena::where('id_CorreoUsuario_Calificado', $id_CorreoUsuario)
                ->whereHas('servicio', function ($q) {
                    $q->where('tipo', 'servicio');
                });

            $promedioClienteUsuario = $resenasRecibidasCliente->avg('calificacion_usuario') ?? 0;
            $countCliente = $resenasRecibidasCliente->count();

            /**
             * Promedio de calificaciones del SERVICIO
             * Calificación del servicio en sí (no del ofertante)
             */
            $promedioServicio = $resenasRecibidasCliente->avg('calificacion_servicio') ?? 0;

            $promedioOfertanteUsuario = round($promedioOfertanteUsuario, 1);
            $promedioClienteUsuario = round($promedioClienteUsuario, 1);
            $promedioServicio = round($promedioServicio, 1);

            /**
             * Promedio GENERAL: promedio ponderado por cantidad real
             */
            $totalCount = $countOfertante + $countCliente;

            $promedioGeneral = 0;
            if ($totalCount > 0) {
                $promedioGeneral = round(
                    (($promedioOfertanteUsuario * $countOfertante) + ($promedioClienteUsuario * $countCliente)) / $totalCount,
                    1
                );
            }

            return response()->json([
                'success' => true,
                'promedio' => [
                    'como_ofertante' => $promedioOfertanteUsuario,
                    'count_ofertante' => $countOfertante,
                    'como_cliente' => $promedioClienteUsuario,
                    'count_cliente' => $countCliente,
                    'servicio' => $promedioServicio,
                    'general' => $promedioGeneral,
                    'total_resenas' => $totalCount,
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

    private function determinarCalificado(Servicio $servicio, ?int $id_Postulacion): ?string
    {
        if ($servicio->tipo === 'servicio') {
            return $servicio->id_Cliente;
        }

        if ($servicio->tipo === 'oportunidad') {
            if ($id_Postulacion) {
                $postulacion = Postulacion::find($id_Postulacion);
                if ($postulacion && $postulacion->id_Usuario) {
                    return $postulacion->id_Usuario;
                }
            }

            $postulacionReciente = Postulacion::where('id_Servicio', $servicio->id_Servicio)
                ->orderBy('created_at', 'desc')
                ->first();

            return $postulacionReciente?->id_Usuario;
        }

        return null;
    }

    /**
     * Determina el rol del usuario calificado en esta interacción.
     *
     * Regla: El rol NUNCA depende del rol actual del usuario,
     * depende del rol que tuvo en esa interacción específica.
     *
     * @param  Servicio  $servicio  El servicio/oportunidad
     * @param  Usuario  $calificador  El usuario que hace la reseña
     * @param  string|null  $id_CorreoUsuario_Calificado  El usuario criticado
     * @return string 'ofertante' | 'cliente'
     */
    private function determinarRolCalificado(Servicio $servicio, Usuario $calificador, ?string $id_CorreoUsuario_Calificado): string
    {
        if (! $id_CorreoUsuario_Calificado) {
            return 'ofertante';
        }

        // En un SERVICIO:
        // - El OFERTANTE es id_Cliente (proveedor del servicio)
        // - El CLIENTE es el postulante (quien contrata)
        if ($servicio->tipo === 'servicio') {
            // Si el calificado es el id_Cliente, fue criticado como ofertante
            if ($id_CorreoUsuario_Calificado === $servicio->id_Cliente) {
                return 'ofertante';
            }

            // Sino, fue criticado como cliente
            return 'cliente';
        }

        // En una OPORTUNIDAD:
        // - El OFERTANTE es el postulante (quien ofrece sus servicios)
        // - El CLIENTE es id_Cliente (quien busca servicios)
        if ($servicio->tipo === 'oportunidad') {
            // Verificar si el calificado es el postulante
            $postulacion = Postulacion::where('id_Servicio', $servicio->id_Servicio)
                ->where('id_Usuario', $id_CorreoUsuario_Calificado)
                ->first();

            if ($postulacion && $postulacion->tipo_postulacion === 'postulante') {
                return 'ofertante';
            }

            return 'cliente';
        }

        return 'ofertante';
    }
}
