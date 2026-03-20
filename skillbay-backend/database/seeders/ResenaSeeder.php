<?php

namespace Database\Seeders;

use App\Models\PagoServicio;
use App\Models\Resena;
use App\Models\Servicio;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class ResenaSeeder extends Seeder
{
    /**
     * Sistema de reseñas bidireccionales CORREGIDO:
     * 
     * El OFERTANTE es quien PROPORCIONA el servicio:
     * - En 'servicio': id_Cliente es el OFERTANTE
     * - En 'oportunidad': El POSTULANTE es el OFERTANTE
     * 
     * El CLIENTE es quien RECIBE/paga por el servicio:
     * - En 'servicio': El SOLICITANTE es el CLIENTE
     * - En 'oportunidad': id_Cliente es el CLIENTE
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

        foreach ($pagosCompletados as $pago) {
            $servicio = Servicio::find($pago->id_Servicio);
            if (!$servicio) continue;

            $pagadorEsDueno = ($pago->id_Pagador === $servicio->id_Cliente);

            /**
             * Determinar la dirección de la reseña según servicio->tipo
             * 
             * TABLA:
             * ┌─────────────────┬──────────────────┬─────────────────────────────────┐
             * │ tipo              │ Pagador es dueño │ Dirección                         │
             * ├─────────────────┼──────────────────┼─────────────────────────────────┤
             * │ servicio        │ SÍ              │ 'ofertante_a_cliente' (dueño es ofertante)│
             * │ servicio        │ NO              │ 'cliente_a_ofertante' (cliente es pagador)  │
             * │ oportunidad     │ SÍ              │ 'cliente_a_ofertante' (dueño es cliente)  │
             * │ oportunidad     │ NO              │ 'ofertante_a_cliente' (postulante es ofertante)│
             * └─────────────────┴──────────────────┴─────────────────────────────────┘
             */
            if ($servicio->tipo === 'servicio') {
                $isOfertanteReview = $pagadorEsDueno;
            } else {
                $isOfertanteReview = !$pagadorEsDueno;
            }

            $direccion = $isOfertanteReview ? 'ofertante_a_cliente' : 'cliente_a_ofertante';

            Resena::create([
                'calificacion' => $faker->randomElement([4, 5, 5, 5, 4]),
                'comentario' => $faker->randomElement($comentariosPositivos),
                'id_Servicio' => $pago->id_Servicio,
                'id_CorreoUsuario' => $pago->id_Pagador,
                'direccion' => $direccion,
                'id_Postulacion' => $pago->id_Postulacion,
            ]);

            if ($faker->boolean(60)) {
                $receptorEsDueno = ($pago->id_Receptor === $servicio->id_Cliente);

                if ($servicio->tipo === 'servicio') {
                    $isOfertanteReviewReceptor = $receptorEsDueno;
                } else {
                    $isOfertanteReviewReceptor = !$receptorEsDueno;
                }

                $direccionReceptor = $isOfertanteReviewReceptor ? 'ofertante_a_cliente' : 'cliente_a_ofertante';

                Resena::create([
                    'calificacion' => $faker->randomElement([4, 5, 5, 4, 4]),
                    'comentario' => $faker->randomElement($comentariosPositivos),
                    'id_Servicio' => $pago->id_Servicio,
                    'id_CorreoUsuario' => $pago->id_Receptor,
                    'direccion' => $direccionReceptor,
                    'id_Postulacion' => $pago->id_Postulacion,
                ]);
            }
        }

        $this->command->info('Se crearon ' . Resena::count() . ' registros de reseñas.');
    }
}
