<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;


class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $planes = [
            [
                'id_Plan' => 'Free',
                'nombre' => 'Free',
                'beneficios' => 'Puede tener hasta 3 servicios propios. Límite mensual de servicios: 3.',
                'precioMensual' => 0,
                'limiteServiciosMes' => 3,
            ],
            [
                'id_Plan' => 'Plus',
                'nombre' => 'Plus',
                'beneficios' => 'Puede tener hasta 5 servicios propios. Límite mensual de servicios: 5.',
                'precioMensual' => 15000,
                'limiteServiciosMes' => 5,
            ],
            [
                'id_Plan' => 'Ultra',
                'nombre' => 'Ultra',
                'beneficios' => 'Puede tener hasta 10 servicios propios. Límite mensual de servicios: 10.',
                'precioMensual' => 30000,
                'limiteServiciosMes' => 10,
            ],
        ];

        foreach ($planes as $plan) {
            Plan::updateOrCreate(
                ['id_Plan' => $plan['id_Plan']],
                $plan
            );
        }
    }
}
