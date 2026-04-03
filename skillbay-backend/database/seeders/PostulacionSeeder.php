<?php

namespace Database\Seeders;

use App\Models\Postulacion;
use App\Models\Servicio;
use App\Models\Usuario;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class PostulacionSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_CO');

        // Estados con distribución realista
        $estados = [
            'pendiente' => 30,      // 30%
            'aceptada' => 20,      // 20%
            'rechazada' => 15,     // 15%
            'en_progreso' => 10,   // 10%
            'completada' => 15,    // 15%
            'pagada' => 5,         // 5%
            'cancelada' => 5,      // 5%
        ];

        $servicios = Servicio::where('estado', 'Activo')->get();

        if ($servicios->isEmpty()) {
            return;
        }

        foreach ($servicios as $servicio) {
            // Más postulaciones para algunos servicios
            $numApplications = rand(2, 6);

            if ($servicio->tipo === 'servicio') {
                $usuarios = Usuario::where('rol', 'ofertante')
                    ->where('id_CorreoUsuario', '!=', $servicio->id_Dueno)
                    ->where('bloqueado', false)
                    ->get();
            } else {
                $usuarios = Usuario::where('rol', 'cliente')
                    ->where('id_CorreoUsuario', '!=', $servicio->id_Dueno)
                    ->where('bloqueado', false)
                    ->get();
            }

            if ($usuarios->isEmpty()) {
                continue;
            }

            $applicants = $usuarios->random(min($numApplications, $usuarios->count()));

            foreach ($applicants as $applicant) {
                $tipoPostulacion = $servicio->tipo === 'servicio' ? 'postulante' : 'solicitante';
                
                // Seleccionar estado basado en pesos
                $estado = $this->weightedRandom($estados);
                
                // Para estados avanzados, solo si el servicio/oportunidad tiene sentido
                if (in_array($estado, ['en_progreso', 'completada', 'pagada'])) {
                    $presupuesto = $servicio->precio ?: $faker->numberBetween(100000, 5000000);
                } else {
                    $presupuesto = $faker->optional(0.7)->numberBetween(50000, 5000000);
                }

                Postulacion::create([
                    'id_Servicio' => $servicio->id_Servicio,
                    'id_Usuario' => $applicant->id_CorreoUsuario,
                    'mensaje' => $faker->paragraph(2),
                    'presupuesto' => $presupuesto,
                    'tiempo_estimado' => $faker->numberBetween(1, 60).' días',
                    'estado' => $estado,
                    'tipo_postulacion' => $tipoPostulacion,
                    'created_at' => $faker->dateTimeBetween('-2 months', 'now'),
                ]);
            }
        }
    }

    private function weightedRandom(array $weights): string
    {
        $total = array_sum($weights);
        $random = rand(1, $total);
        
        $running = 0;
        foreach ($weights as $estado => $weight) {
            $running += $weight;
            if ($random <= $running) {
                return $estado;
            }
        }
        
        return 'pendiente';
    }
}