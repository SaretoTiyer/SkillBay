<?php

namespace Database\Seeders;

use App\Models\Mensaje;
use App\Models\Postulacion;
use App\Models\Usuario;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class MensajeSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_CO');

        // Solo postulaciones aceptadas o en progreso (donde tiene sentido chatting)
        $postulacionesActivas = Postulacion::whereIn('estado', ['aceptada', 'en_progreso'])->get();

        if ($postulacionesActivas->isEmpty()) {
            $this->command->info('No hay postulaciones activas para crear mensajes.');
            return;
        }

        $mensajesPlantillas = [
            'Hola, me interesa tu servicio.',
            'Gracias por tu postulacion. Puedes enviarme más detalles?',
            'Si, claro. Cuando puedes comenzar?',
            'Perfecto, Podemos agendar una reunión para discutir los detalles?',
            'Tengo algunas preguntas sobre el proyecto.',
            'El presupuesto me parece adecuado. Acepto.',
            'Necesito hacer algunos ajustes al proyecto.',
            'Cuando tendrias listo el primer avance?',
            'Te envío los archivos solicitados.',
            'Gracias por la actualización. Quedo atento.',
            'Buen trabajo, me gusta la propuesta.',
            'Podemos programar una videollamada?',
            'El tiempo de entrega me parece bien.',
            'Te contactaré en breve con más información.',
            'Excelente, muchas gracias por tu interés.',
        ];

        // Crear mensajes para postulaciones activas
        foreach ($postulacionesActivas as $postulacion) {
            // Solo algunas postulaciones tienen conversaciones
            if (!$faker->boolean(40)) {
                continue;
            }

            $servicio = $postulacion->servicio;
            if (!$servicio) continue;

            $emisor1 = $postulacion->id_Usuario;
            $emisor2 = $servicio->id_Dueno;

            if ($emisor1 === $emisor2) continue; // Mismo usuario, no tiene sentido chat

            $numMensajes = rand(2, 8);
            $ultimoEmisor = $emisor1;
            $fechaMensaje = $postulacion->created_at;

            for ($i = 0; $i < $numMensajes; $i++) {
                // Alternar entre los dos usuarios
                $emisor = $ultimoEmisor === $emisor1 ? $emisor2 : $emisor1;
                $ultimoEmisor = $emisor;

                $fechaMensaje = $faker->dateTimeBetween($fechaMensaje, '+2 days');

                Mensaje::create([
                    'id_Postulacion' => $postulacion->id,
                    'id_Emisor' => $emisor,
                    'mensaje' => $mensajesPlantillas[array_rand($mensajesPlantillas)],
                    'expiraEn' => $faker->optional(0.2)->dateTimeBetween('+1 week', '+1 month'),
                    'created_at' => $fechaMensaje,
                ]);
            }
        }

        $this->command->info('Se crearon ' . Mensaje::count() . ' registros de mensajes.');
    }
}