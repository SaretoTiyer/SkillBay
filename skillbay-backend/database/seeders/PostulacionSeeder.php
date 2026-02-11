<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Postulacion;
use App\Models\Servicio;
use App\Models\Usuario;
use Faker\Factory as Faker;

class PostulacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_CO');
        
        $servicios = Servicio::all();
        $usuarios = Usuario::where('rol', 'ofertante')->get();

        if ($servicios->isEmpty() || $usuarios->isEmpty()) {
            return;
        }

        foreach ($servicios as $servicio) {
            // 0 to 5 applications per service
            $numApplications = rand(0, 5);
            
            // Get random users to apply
            $applicants = $usuarios->random(min($numApplications, $usuarios->count()));

            foreach ($applicants as $applicant) {
                // Ensure applicant is not the service owner
                if ($applicant->id_CorreoUsuario !== $servicio->id_Cliente) {
                    Postulacion::create([
                        'id_Servicio' => $servicio->id_Servicio,
                        'id_Usuario' => $applicant->id_CorreoUsuario,
                        'mensaje' => $faker->paragraph(2),
                        'presupuesto' => $faker->optional(0.7)->numberBetween(50000, 5000000), // 70% chance of budget
                        'tiempo_estimado' => $faker->numberBetween(1, 30) . ' días',
                        'estado' => $faker->randomElement(['pendiente', 'pendiente', 'aceptada', 'rechazada']),
                        'created_at' => $faker->dateTimeBetween('-1 month', 'now'),
                    ]);
                }
            }
        }
    }
}
