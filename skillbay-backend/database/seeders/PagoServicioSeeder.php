<?php

namespace Database\Seeders;

use App\Models\PagoServicio;
use App\Models\Postulacion;
use App\Models\Servicio;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class PagoServicioSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_CO');

        $postulaciones = Postulacion::whereIn('estado', ['aceptada', 'en_progreso', 'completada', 'pagada'])->get();

        if ($postulaciones->isEmpty()) {
            $this->command->info('No hay postulaciones para crear pagos.');
            return;
        }

        $metodosPago = ['Nequi', 'Bancolombia', 'PSE', 'Tarjeta de Credito', 'Transferencia'];
        $modalidades = ['único', 'mensual', 'quincenal', 'por hora'];

        foreach ($postulaciones as $postulacion) {
            $servicio = Servicio::find($postulacion->id_Servicio);
            if (! $servicio) {
                continue;
            }

            // Determinar pagador y receptor según tipo
            if ($servicio->tipo === 'servicio') {
                $idPagador = $postulacion->id_Usuario;
                $idReceptor = $servicio->id_Dueno;
            } else {
                $idPagador = $servicio->id_Dueno;
                $idReceptor = $postulacion->id_Usuario;
            }

            $monto = $postulacion->presupuesto ?? $servicio->precio ?? $faker->numberBetween(100000, 3000000);
            
            // Estado del pago basado en estado de postulación
            $estadoPago = match($postulacion->estado) {
                'pagada' => 'Completado',
                'completada' => $faker->randomElement(['Completado', 'Pendiente']),
                'en_progreso' => 'Pendiente',
                'aceptada' => 'Pendiente',
                default => 'Pendiente',
            };

            $fechaPago = $faker->dateTimeBetween($postulacion->created_at, 'now');
            $referencia = 'PAY-' . strtoupper($faker->regexify('[A-Z0-9]{8}'));

            // Para pagos completados, agregar más datos
            // Usar picsum.photos (HTTPS) en vez de faker->imageUrl() que genera URLs HTTP
            $seed = $faker->numberBetween(1, 1000);
            $comprobante = $estadoPago === 'Completado' ? "https://picsum.photos/seed/{$seed}/400/300" : null;
            $fechaComprobante = $comprobante ? $faker->dateTimeBetween($fechaPago, 'now') : null;

            PagoServicio::create([
                'monto' => $monto,
                'fechaPago' => $fechaPago,
                'estado' => $estadoPago,
                'metodoPago' => $faker->randomElement($metodosPago),
                'referenciaPago' => $referencia,
                'comprobante' => $comprobante,
                'fecha_comprobante' => $fechaComprobante,
                'modalidadPago' => $faker->randomElement($modalidades),
                'modalidadServicio' => $servicio->modo_trabajo,
                'identificacionCliente' => $faker->numerify('###########'),
                'origenSolicitud' => $faker->randomElement(['web', 'mobile', 'api']),
                'id_Servicio' => $postulacion->id_Servicio,
                'id_Postulacion' => $postulacion->id,
                'id_Pagador' => $idPagador,
                'id_Receptor' => $idReceptor,
            ]);
        }

        $this->command->info('Se crearon '.PagoServicio::count().' registros de pago_servicios.');
    }
}