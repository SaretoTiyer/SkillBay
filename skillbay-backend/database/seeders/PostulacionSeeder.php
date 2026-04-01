<?php

namespace Database\Seeders;

use App\Models\Postulacion;
use App\Models\Servicio;
use App\Models\Usuario;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class PostulacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * TIPOS DE POSTULACIÓN:
     * - 'postulante': El usuario POSTULA a un servicio (quiere trabajar)
     *   * En servicios: El postulante es el OFERTANTE potencial
     *   * El rol cambia a OFERTANTE al ser aceptado
     *
     * - 'solicitante': El usuario SOLICITA una oportunidad (quiere contratar)
     *   * En oportunidades: El solicitante es el CLIENTE potencial
     *
     * FLUJO:
     * - Cliente crea oportunidad → tipo = 'solicitante'
     * - Ofertante postula a servicio → tipo = 'postulante'
     */
    public function run(): void
    {
        $faker = Faker::create('es_CO');

        $servicios = Servicio::all();

        if ($servicios->isEmpty()) {
            return;
        }

        foreach ($servicios as $servicio) {
            $numApplications = rand(0, 5);

            if ($servicio->tipo === 'servicio') {
                $usuarios = Usuario::where('rol', 'ofertante')
                    ->where('id_CorreoUsuario', '!=', $servicio->id_Cliente)
                    ->get();
            } else {
                $usuarios = Usuario::where('rol', 'cliente')
                    ->where('id_CorreoUsuario', '!=', $servicio->id_Cliente)
                    ->get();
            }

            if ($usuarios->isEmpty()) {
                continue;
            }

            $applicants = $usuarios->random(min($numApplications, $usuarios->count()));

            foreach ($applicants as $applicant) {
                $tipoPostulacion = $servicio->tipo === 'servicio' ? 'postulante' : 'solicitante';

                Postulacion::create([
                    'id_Servicio' => $servicio->id_Servicio,
                    'id_Usuario' => $applicant->id_CorreoUsuario,
                    'mensaje' => $faker->paragraph(2),
                    'presupuesto' => $faker->optional(0.7)->numberBetween(50000, 5000000),
                    'tiempo_estimado' => $faker->numberBetween(1, 30).' días',
                    'estado' => $faker->randomElement(['pendiente', 'pendiente', 'aceptada', 'rechazada']),
                    'tipo_postulacion' => $tipoPostulacion,
                    'created_at' => $faker->dateTimeBetween('-1 month', 'now'),
                ]);
            }
        }
    }
}
