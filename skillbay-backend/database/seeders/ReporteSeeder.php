<?php

namespace Database\Seeders;

use App\Models\Postulacion;
use App\Models\Reporte;
use App\Models\Servicio;
use App\Models\Usuario;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class ReporteSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_CO');

        $estados = [
            'pendiente' => 35,
            'en_revision' => 25,
            'resuelto' => 25,
            'descartado' => 15,
        ];

        $motivos = [
            'Contenido inapropiado en el servicio',
            'Spam o publicidad engañosa',
            'Fraude o estafa suspected',
            'Comportamiento inadecuado del usuario',
            'Servicio no entregado como se pactó',
            'Calificación falsa o manipulada',
            'Información incorrecta o incompleta',
            'Violación de términos y condiciones',
            'Usar imagen sin autorización',
            'Otro motivo justificado',
        ];

        $servicios = Servicio::where('estado', 'Activo')->get();
        $postulaciones = Postulacion::all();
        
        $reportadores = Usuario::where('bloqueado', false)->where('rol', '!=', 'admin')->get();
        $reportados = Usuario::where('bloqueado', false)->get();

        if ($reportadores->isEmpty() || $reportados->isEmpty()) {
            $this->command->info('No hay usuarios para crear reportes.');
            return;
        }

        // Crear reportes de servicios
        foreach ($servicios->random(min(8, $servicios->count())) as $servicio) {
            $reportador = $reportadores->random();
            $reportado = $reportados->where('id_CorreoUsuario', '!=', $reportador->id_CorreoUsuario)->random();

            Reporte::create([
                'id_Reportador' => $reportador->id_CorreoUsuario,
                'id_Reportado' => $reportado->id_CorreoUsuario,
                'id_Servicio' => $servicio->id_Servicio,
                'id_Postulacion' => null,
                'motivo' => $faker->randomElement($motivos),
                'estado' => $this->weightedRandom($estados),
                'created_at' => $faker->dateTimeBetween('-2 months', 'now'),
            ]);
        }

        // Crear reportes de postulaciones
        foreach ($postulaciones->random(min(6, $postulaciones->count())) as $postulacion) {
            $reportador = $reportadores->random();
            $reportado = $postulacion->id_Usuario;
            
            // Skip if reporting yourself
            if ($reportador->id_CorreoUsuario === $reportado) {
                continue;
            }

            Reporte::create([
                'id_Reportador' => $reportador->id_CorreoUsuario,
                'id_Reportado' => $reportado,
                'id_Servicio' => $postulacion->id_Servicio,
                'id_Postulacion' => $postulacion->id,
                'motivo' => $faker->randomElement($motivos),
                'estado' => $this->weightedRandom($estados),
                'created_at' => $faker->dateTimeBetween('-2 months', 'now'),
            ]);
        }

        $this->command->info('Se crearon ' . Reporte::count() . ' registros de reportes.');
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