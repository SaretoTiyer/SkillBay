<?php

namespace Database\Seeders;

use App\Models\PagoServicio;
use App\Models\Postulacion;
use App\Models\Resena;
use App\Models\Servicio;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class ResenaSeeder extends Seeder
{
    /**
     * Sistema de calificaciones (MODELO ACTUALIZADO):
     *
     * ESTRUCTURA:
     * - id_CorreoUsuario = CALIFICADOR (quien hace la reseña)
     * - id_CorreoUsuario_Calificado = CALIFICADO (quien recibe la reseña)
     *
     * TIPO SERVICIO (Bidireccional):
     * - El CLIENTE (postulante) califica al OFERTANTE (id_Cliente)
     *   → id_CorreoUsuario = postulante
     *   → id_CorreoUsuario_Calificado = id_Cliente
     *   → calificacion_usuario = X
     *   → calificacion_servicio = Y
     *
     * TIPO OPORTUNIDAD (Unilateral):
     * - El CLIENTE (id_Cliente) califica al OFERTANTE (postulante)
     *   → id_CorreoUsuario = id_Cliente
     *   → id_CorreoUsuario_Calificado = postulante
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
    public function run(): void
    {
        $faker = Faker::create('es_CO');

        $pagosCompletados = PagoServicio::where('estado', 'Completado')->get();

        if ($pagosCompletados->isEmpty()) {
            $this->command->info('No hay pagos completados para crear reseñas. Ejecuta PagoServicioSeeder primero.');

            return;
        }

        $comentariosPositivos = [
            'Excelente servicio, muy profesional y puntual.',
            'Quedé muy satisfecho con el resultado. ¡Recomendado!',
            'Gran trabajo, superó mis expectativas.',
            'Muy buena comunicación y entregado a tiempo.',
            'El freelancer es muy talentoso, volveré a contratar.',
            'Experiencia excelente, resolvió todas mis dudas.',
            'Trabajo de alta calidad, muy recomendado.',
            'Cumplió con todo lo pactado, excelente.',
        ];

        $count = 0;

        foreach ($pagosCompletados as $pago) {
            $servicio = Servicio::find($pago->id_Servicio);
            if (! $servicio) {
                continue;
            }

            if ($servicio->tipo === 'servicio') {
                /**
                 * SERVICIO:
                 * - CLIENTE (pagador) califica al OFERTANTE (id_Cliente)
                 * - id_CorreoUsuario = pagador (CLIENTE)
                 * - id_CorreoUsuario_Calificado = id_Cliente (OFERTANTE)
                 */
                $calificacionUsuario = $faker->randomElement([4, 5, 5, 5, 4]);
                $calificacionServicio = $faker->randomElement([4, 5, 5, 5, 4]);

                Resena::create([
                    'calificacion_usuario' => $calificacionUsuario,
                    'calificacion_servicio' => $calificacionServicio,
                    'comentario' => $faker->randomElement($comentariosPositivos),
                    'id_Servicio' => $pago->id_Servicio,
                    'id_CorreoUsuario' => $pago->id_Pagador,
                    'id_CorreoUsuario_Calificado' => $servicio->id_Cliente,
                    'id_Postulacion' => $pago->id_Postulacion,
                ]);

                $count++;

                /**
                 * Reseña del OFERTANTE al CLIENTE (opcional, bidireccional)
                 */
                if ($faker->boolean(60)) {
                    $calificacionReceptor = $faker->randomElement([4, 5, 5, 4, 4]);

                    Resena::create([
                        'calificacion_usuario' => $calificacionReceptor,
                        'calificacion_servicio' => null,
                        'comentario' => $faker->randomElement($comentariosPositivos),
                        'id_Servicio' => $pago->id_Servicio,
                        'id_CorreoUsuario' => $pago->id_Receptor,
                        'id_CorreoUsuario_Calificado' => $pago->id_Pagador,
                        'id_Postulacion' => $pago->id_Postulacion,
                    ]);

                    $count++;
                }
            } else {
                /**
                 * OPORTUNIDAD:
                 * - CLIENTE (id_Cliente del servicio) califica al OFERTANTE (postulante)
                 * - id_CorreoUsuario = id_Cliente (CLIENTE)
                 * - id_CorreoUsuario_Calificado = postulante
                 */
                $calificacionUsuario = $faker->randomElement([4, 5, 5, 5, 4]);

                $postulacion = Postulacion::find($pago->id_Postulacion);
                $calificado = $postulacion?->id_Usuario ?? $pago->id_Receptor;

                Resena::create([
                    'calificacion_usuario' => $calificacionUsuario,
                    'calificacion_servicio' => null,
                    'comentario' => $faker->randomElement($comentariosPositivos),
                    'id_Servicio' => $pago->id_Servicio,
                    'id_CorreoUsuario' => $servicio->id_Cliente,
                    'id_CorreoUsuario_Calificado' => $calificado,
                    'id_Postulacion' => $pago->id_Postulacion,
                ]);

                $count++;
            }
        }

        $this->command->info("Se crearon {$count} registros de reseñas.");
    }
}
