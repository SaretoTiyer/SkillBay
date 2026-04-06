<?php

namespace Database\Seeders;

use App\Models\PagoPlan;
use App\Models\Plan;
use App\Models\Usuario;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class PagoPlanSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_CO');

        $planes = Plan::all();
        if ($planes->isEmpty()) {
            $this->command->info('No hay planes. Ejecuta PlanSeeder primero.');
            return;
        }

        $metodosPago = ['Nequi', 'Bancolombia', 'PSE', 'Tarjeta de Credito', 'Transferencia'];

        // Usuarios con planes de pago (Plus, Ultra, Enterprise)
        $usuariosPagos = Usuario::whereIn('id_Plan', ['Plus', 'Ultra', 'Enterprise'])
            ->where('rol', '!=', 'admin')
            ->get();

        if ($usuariosPagos->isEmpty()) {
            $this->command->info('No hay usuarios con planes de pago.');
            return;
        }

        foreach ($usuariosPagos as $usuario) {
            $plan = Plan::find($usuario->id_Plan);
            if (!$plan || $plan->precioMensual == 0) {
                continue;
            }

            // Crear 1-3 pagos por usuario (simular suscripciones actuales y pasadas)
            $numPagos = rand(1, 3);

            for ($i = 0; $i < $numPagos; $i++) {
                $fechaInicio = $faker->dateTimeBetween('-12 months', '-1 month');
                $fechaFin = (clone $fechaInicio)->modify('+1 month');
                $esActual = $i === 0 && $faker->boolean(80);

                // Estado del pago
                $estado = $esActual ? 'Completado' : $faker->randomElement(['Completado', 'Completado', 'Pendiente']);
                
                $referencia = 'PLAN-' . strtoupper($faker->regexify('[A-Z0-9]{8}'));

                PagoPlan::create([
                    'monto' => $plan->precioMensual,
                    'fechaPago' => $fechaInicio,
                    'estado' => $estado,
                    'metodoPago' => $faker->randomElement($metodosPago),
                    'referenciaPago' => $referencia,
                    'modalidadPago' => 'mensual',
                    'fechaInicioPlan' => $fechaInicio->format('Y-m-d'),
                    'fechaFinPlan' => $fechaFin->format('Y-m-d'),
                    'id_CorreoUsuario' => $usuario->id_CorreoUsuario,
                    'id_Plan' => $plan->id_Plan,
                ]);
            }
        }

        $this->command->info('Se crearon ' . PagoPlan::count() . ' registros de pago_planes.');
    }
}