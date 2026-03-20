<?php

namespace Database\Seeders;

use App\Models\PagoServicio;
use App\Models\Postulacion;
use App\Models\Servicio;
use App\Models\Usuario;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class PagoServicioSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_CO');

        $postulaciones = Postulacion::whereIn('estado', ['aceptada', 'en_progreso', 'completada', 'pagada'])->get();

        if ($postulaciones->isEmpty()) {
            $this->command->info('No hay postulaciones aceptadas para crear pagos. Ejecuta PostulacionSeeder primero.');
            return;
        }

        $metodosPago = ['MercadoPago', 'Nequi', 'Bancolombia', 'PSE', 'Tarjeta de Crédito', 'Transferencia'];

        foreach ($postulaciones as $postulacion) {
            $servicio = Servicio::find($postulacion->id_Servicio);
            if (!$servicio) continue;

            $clienteEmail = $servicio->id_Cliente;
            $ofertanteEmail = $postulacion->id_Usuario;

            $monto = $postulacion->presupuesto ?? $servicio->precio;

            $isCompletado = in_array($postulacion->estado, ['completada', 'pagada']) || $faker->boolean(60);
            $estado = $isCompletado ? 'Completado' : 'Pendiente';
            $fechaPago = $faker->dateTimeBetween($postulacion->updated_at, 'now');

            PagoServicio::create([
                'monto' => $monto,
                'fechaPago' => $fechaPago,
                'estado' => $estado,
                'metodoPago' => $faker->randomElement($metodosPago),
                'referenciaPago' => $faker->regexify('[A-Z0-9]{10}'),
                'id_Servicio' => $postulacion->id_Servicio,
                'id_Postulacion' => $postulacion->id,
                'id_Pagador' => $clienteEmail,
                'id_Receptor' => $ofertanteEmail,
            ]);
        }

        $this->command->info('Se crearon ' . PagoServicio::count() . ' registros de pago_servicios.');
    }
}
