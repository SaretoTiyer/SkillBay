<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $planes = [
            [
                'id_Plan' => 'Free',
                'nombre' => 'Free',
                'beneficios' => 'Hasta 3 servicios activos. Publica hasta 3 oportunidades/servicios por mes. Acceso básico a la plataforma.',
                'precioMensual' => 0,
                'limiteServiciosMes' => 3,
            ],
            [
                'id_Plan' => 'Plus',
                'nombre' => 'Plus',
                'beneficios' => 'Hasta 5 servicios activos. Publica hasta 5 oportunidades/servicios por mes. Soporte prioritario. Visibilidad avanzada.',
                'precioMensual' => 15000,
                'limiteServiciosMes' => 5,
            ],
            [
                'id_Plan' => 'Ultra',
                'nombre' => 'Ultra',
                'beneficios' => 'Hasta 10 servicios activos. Publica hasta 10 oportunidades/servicios por mes. Soporte VIP. Máxima visibilidad. Badges exclusivos.',
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
