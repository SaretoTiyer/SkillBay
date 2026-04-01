<?php

namespace Database\Seeders;

use App\Models\PagoServicio;
use App\Models\Postulacion;
use App\Models\Servicio;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class PagoServicioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * ESTRUCTURA DE PAGOS:
     * - id_Pagador = CLIENTE (quien paga)
     * - id_Receptor = OFERTANTE (quien recibe el pago)
     *
     * FLUJO POR TIPO:
     *
     * SERVICIO:
     * - El CLIENTE (postulante) paga al OFERTANTE (id_Cliente)
     * - id_Pagador = postulante
     * - id_Receptor = id_Cliente
     *
     * OPORTUNIDAD:
     * - El CLIENTE (id_Cliente) paga al OFERTANTE (postulante)
     * - id_Pagador = id_Cliente
     * - id_Receptor = postulante
     */
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
            if (! $servicio) {
                continue;
            }

            if ($servicio->tipo === 'servicio') {
                $idPagador = $postulacion->id_Usuario;
                $idReceptor = $servicio->id_Cliente;
            } else {
                $idPagador = $servicio->id_Cliente;
                $idReceptor = $postulacion->id_Usuario;
            }

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
                'id_Pagador' => $idPagador,
                'id_Receptor' => $idReceptor,
            ]);
        }

        $this->command->info('Se crearon '.PagoServicio::count().' registros de pago_servicios.');
    }
}
