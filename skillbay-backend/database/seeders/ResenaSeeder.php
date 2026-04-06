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
    public function run(): void
    {
        $faker = Faker::create('es_CO');

        $pagosCompletados = PagoServicio::where('estado', 'Completado')->get();

        if ($pagosCompletados->isEmpty()) {
            $this->command->info('No hay pagos completados para crear reseñas.');
            return;
        }

        $comentariosPositivos = [
            'Excelente servicio, muy profesional y puntual.',
            'Quede muy satisfecho con el resultado. ¡Recomendado!',
            'Gran trabajo, supero mis expectativas.',
            'Muy buena comunicación y entregado a tiempo.',
            'El freelancer es muy talentoso, volvere a contratar.',
            'Experiencia excelente, resolvio todas mis dudas.',
            'Trabajo de alta calidad, muy recomendado.',
            'Cumplio con todo lo pactado, excelente.',
            'Perfecto, exactamente lo que necesitaba.',
            'Gran atención y calidad en el trabajo.',
        ];

        $comentariosNeutrales = [
            'Buen servicio, cumpliria expectativas.',
            'Trabajo correcto, puntuales.',
            'Aceptable, aunque hubo pequeños retrasos.',
            'Bien en general,推荐.',
        ];

        $comentariosNegativos = [
            'El servicio no fue lo que esperaba.',
            'Tuvo retrasos en la entrega.',
            'No recomiendo este proveedor.',
            'Calidad inferior a lo pactado.',
        ];

        $count = 0;

        foreach ($pagosCompletados as $pago) {
            $servicio = Servicio::find($pago->id_Servicio);
            if (! $servicio) {
                continue;
            }

            // Validar que la postulación existe en la DB (evita FK violation)
            $postulacionIdValido = null;
            if ($pago->id_Postulacion) {
                $postulacionExiste = Postulacion::where('id', $pago->id_Postulacion)->exists();
                $postulacionIdValido = $postulacionExiste ? $pago->id_Postulacion : null;
            }

            if ($servicio->tipo === 'servicio') {
                // ========== SERVICIO ==========
                // CLIENTE (pagador) califica al OFERTANTE (dueno del servicio)
                $calificacionUsuario = $this->weightedRating([1, 2, 3, 4, 5], [5, 8, 15, 35, 37]);
                $calificacionServicio = $this->weightedRating([1, 2, 3, 4, 5], [3, 5, 12, 40, 40]);

                $comentario = $this->getComentario($calificacionUsuario, $comentariosPositivos, $comentariosNeutrales, $comentariosNegativos);

                Resena::create([
                    'calificacion_usuario' => $calificacionUsuario,
                    'calificacion_servicio' => $calificacionServicio,
                    'comentario' => $comentario,
                    'id_Servicio' => $pago->id_Servicio,
                    'id_CorreoUsuario' => $pago->id_Pagador,
                    'id_CorreoUsuario_Calificado' => $servicio->id_Dueno,
                    'rol_calificado' => 'ofertante',
                    'id_Postulacion' => $postulacionIdValido,
                ]);
                $count++;

                // ========== RESEÑA INVERSA ==========
                // OFERTANTE (receptor) califica al CLIENTE (pagador)
                if ($faker->boolean(70)) {
                    $calificacionReceptor = $this->weightedRating([1, 2, 3, 4, 5], [3, 5, 12, 45, 35]);
                    $comentarioReceptor = $this->getComentario($calificacionReceptor, $comentariosPositivos, $comentariosNeutrales, $comentariosNegativos);

                    Resena::create([
                        'calificacion_usuario' => $calificacionReceptor,
                        'calificacion_servicio' => null,
                        'comentario' => $comentarioReceptor,
                        'id_Servicio' => $pago->id_Servicio,
                        'id_CorreoUsuario' => $pago->id_Receptor,
                        'id_CorreoUsuario_Calificado' => $pago->id_Pagador,
                        'rol_calificado' => 'cliente',
                        'id_Postulacion' => $postulacionIdValido,
                    ]);
                    $count++;
                }
            } else {
                // ========== OPORTUNIDAD ==========
                // CLIENTE (dueno del servicio) califica al OFERTANTE (postulante)
                $calificacionUsuario = $this->weightedRating([1, 2, 3, 4, 5], [5, 8, 15, 35, 37]);

                $postulacion = $postulacionIdValido ? Postulacion::find($postulacionIdValido) : null;
                $calificado = $postulacion?->id_Usuario ?? $pago->id_Receptor;

                $comentario = $this->getComentario($calificacionUsuario, $comentariosPositivos, $comentariosNeutrales, $comentariosNegativos);

                Resena::create([
                    'calificacion_usuario' => $calificacionUsuario,
                    'calificacion_servicio' => null,
                    'comentario' => $comentario,
                    'id_Servicio' => $pago->id_Servicio,
                    'id_CorreoUsuario' => $servicio->id_Dueno,
                    'id_CorreoUsuario_Calificado' => $calificado,
                    'rol_calificado' => 'ofertante',
                    'id_Postulacion' => $postulacionIdValido,
                ]);
                $count++;

                // ========== RESEÑA INVERSA ==========
                // OFERTANTE (postulant) califica al CLIENTE (dueno)
                if ($faker->boolean(60)) {
                    $calificacionReceptor = $this->weightedRating([1, 2, 3, 4, 5], [3, 5, 12, 45, 35]);
                    $comentarioReceptor = $this->getComentario($calificacionReceptor, $comentariosPositivos, $comentariosNeutrales, $comentariosNegativos);

                    Resena::create([
                        'calificacion_usuario' => $calificacionReceptor,
                        'calificacion_servicio' => null,
                        'comentario' => $comentarioReceptor,
                        'id_Servicio' => $pago->id_Servicio,
                        'id_CorreoUsuario' => $calificado,
                        'id_CorreoUsuario_Calificado' => $servicio->id_Dueno,
                        'rol_calificado' => 'cliente',
                        'id_Postulacion' => $postulacionIdValido,
                    ]);
                    $count++;
                }
            }
        }

        $this->command->info("Se crearon {$count} registros de reseñas.");
    }

    private function weightedRating(array $values, array $weights): int
    {
        $total = array_sum($weights);
        $random = rand(1, $total);
        $running = 0;
        foreach ($values as $i => $value) {
            $running += $weights[$i];
            if ($random <= $running) {
                return $value;
            }
        }
        return 4;
    }

    private function getComentario(int $rating, array $positivos, array $neutrales, array $negativos): string
    {
        if ($rating >= 4) {
            return $positivos[array_rand($positivos)];
        } elseif ($rating === 3) {
            return $neutrales[array_rand($neutrales)];
        } else {
            return $negativos[array_rand($negativos)];
        }
    }
}