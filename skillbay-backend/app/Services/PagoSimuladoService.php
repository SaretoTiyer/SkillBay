<?php

namespace App\Services;

use App\Models\Notificacion;
use App\Models\PagoPlan;
use App\Models\PagoServicio;
use App\Models\Plan;
use App\Models\Postulacion;
use App\Models\Usuario;
use Illuminate\Support\Str;

class PagoSimuladoService
{
    public const METODO_TARJETA = 'tarjeta';

    public const METODO_EFECTIVO = 'efectivo';

    public const METODO_NEQUI = 'nequi';

    public const METODO_BANCOLOMBIA_QR = 'bancolombia_qr';

    public const CATEGORIA_DIGITAL = 'digital';

    public const CATEGORIA_EFECTIVO = 'efectivo';

    public const ESTADO_PENDIENTE = 'Pendiente';

    public const ESTADO_COMPLETADO = 'Completado';

    public const ESTADO_FALLIDO = 'Fallido';

    public const TIPO_PLAN = 'plan';

    public const TIPO_SERVICIO = 'servicio';

    public function iniciarPagoPlan(string|int $idPlan, string $idUsuario, string $metodo): array
    {
        $plan = Plan::findOrFail($idPlan);

        $pago = PagoPlan::create([
            'monto' => $plan->precioMensual,
            'fechaPago' => now(),
            'estado' => self::ESTADO_PENDIENTE,
            'metodoPago' => $metodo,
            'referenciaPago' => $this->generarReferencia(),
            'modalidadPago' => $this->getModalidadFromMetodo($metodo),
            'id_CorreoUsuario' => $idUsuario,
            'id_Plan' => $plan->id_Plan,
        ]);

        return [
            'id_pago' => $pago->id_PagoPlan,
            'tipo' => self::TIPO_PLAN,
            'referencia' => $pago->referenciaPago,
            'monto' => $pago->monto,
            'metodo' => $metodo,
            'estado' => $pago->estado,
            'descripcion' => "Pago de plan {$plan->nombre}",
        ];
    }

    public function iniciarPagoServicio(
        int $idPostulacion,
        string $idPagador,
        string $metodo,
        string $modalidadServicio
    ): array {
        $postulacion = Postulacion::with(['servicio', 'usuario'])->findOrFail($idPostulacion);
        $servicio = $postulacion->servicio;
        $receptor = $postulacion->usuario;

        $pago = PagoServicio::create([
            'monto' => $postulacion->presupuesto ?? $servicio->precio,
            'fechaPago' => now(),
            'estado' => self::ESTADO_PENDIENTE,
            'metodoPago' => $metodo,
            'referenciaPago' => $this->generarReferencia(),
            'modalidadPago' => $this->getModalidadFromMetodo($metodo),
            'modalidadServicio' => $modalidadServicio,
            'identificacionCliente' => $idPagador,
            'origenSolicitud' => 'dashboard',
            'id_Postulacion' => $postulacion->id,
            'id_Servicio' => $servicio->id_Servicio,
            'id_Pagador' => $idPagador,
            'id_Receptor' => $receptor->id_CorreoUsuario,
        ]);

        return [
            'id_pago' => $pago->id_PagoServicio,
            'tipo' => self::TIPO_SERVICIO,
            'referencia' => $pago->referenciaPago,
            'monto' => $pago->monto,
            'metodo' => $metodo,
            'estado' => $pago->estado,
            'descripcion' => "Pago por servicio: {$servicio->titulo}",
        ];
    }

    public function procesarPago(int $idPago, string $tipo, array $datosPago = []): array
    {
        $resultado = $this->simularProcesamiento($datosPago);

        if ($tipo === self::TIPO_PLAN) {
            return $this->actualizarPagoPlan($idPago, $resultado);
        }

        return $this->actualizarPagoServicio($idPago, $resultado);
    }

    public function aprobarPagoAutomatico(int $idPago, string $tipo): array
    {
        if ($tipo === self::TIPO_PLAN) {
            return $this->actualizarPagoPlan($idPago, [
                'estado' => self::ESTADO_COMPLETADO,
                'simulado' => true,
                'mensaje' => 'Pago aprobado automáticamente',
            ]);
        }

        return $this->actualizarPagoServicio($idPago, [
            'estado' => self::ESTADO_COMPLETADO,
            'simulado' => true,
            'mensaje' => 'Pago aprobado automáticamente',
        ]);
    }

    public function obtenerEstado(int $idPago, string $tipo): ?array
    {
        if ($tipo === self::TIPO_PLAN) {
            $pago = PagoPlan::find($idPago);
            if (! $pago) {
                return null;
            }

            return [
                'id_pago' => $pago->id_PagoPlan,
                'tipo' => self::TIPO_PLAN,
                'referencia' => $pago->referenciaPago,
                'monto' => $pago->monto,
                'metodo' => $pago->metodoPago,
                'estado' => $pago->estado,
                'fecha' => $pago->fechaPago,
            ];
        }

        $pago = PagoServicio::find($idPago);
        if (! $pago) {
            return null;
        }

        return [
            'id_pago' => $pago->id_PagoServicio,
            'tipo' => self::TIPO_SERVICIO,
            'referencia' => $pago->referenciaPago,
            'monto' => $pago->monto,
            'metodo' => $pago->metodoPago,
            'estado' => $pago->estado,
            'fecha' => $pago->fechaPago,
        ];
    }


    public function iniciarPagoServicioDirecto(
        string $idServicio,
        string $idPagador,
        string $metodo
    ): array {
        $servicio = \App\Models\Servicio::where('id_Servicio', $idServicio)->firstOrFail();
        $monto = $servicio->precio ?? 0;

        $pago = PagoServicio::create([
            'monto' => $monto,
            'fechaPago' => now(),
            'estado' => self::ESTADO_PENDIENTE,
            'metodoPago' => $metodo,
            'referenciaPago' => $this->generarReferencia(),
            'modalidadPago' => $this->getModalidadFromMetodo($metodo),
            'modalidadServicio' => 'virtual',
            'identificacionCliente' => $idPagador,
            'origenSolicitud' => 'checkout',
            'id_Servicio' => $servicio->id_Servicio,
            'id_Pagador' => $idPagador,
            'id_Receptor' => $servicio->id_Dueno,
        ]);

        return [
            'id_pago' => $pago->id_PagoServicio,
            'tipo' => self::TIPO_SERVICIO,
            'referencia' => $pago->referenciaPago,
            'monto' => $pago->monto,
            'metodo' => $metodo,
            'estado' => $pago->estado,
            'descripcion' => "Pago por servicio: {$servicio->titulo}",
        ];
    }

    private function generarReferencia(): string
    {
        return 'PAY-'.strtoupper(Str::random(10));
    }

    private function getModalidadFromMetodo(string $metodo): string
    {
        return match ($metodo) {
            self::METODO_TARJETA => 'Virtual',
            self::METODO_NEQUI => 'Virtual',
            self::METODO_BANCOLOMBIA_QR => 'Virtual',
            self::METODO_EFECTIVO => 'Efectivo',
            default => 'Virtual',
        };
    }

    public function getCategoriaFromMetodo(string $metodo): string
    {
        return match ($metodo) {
            self::METODO_TARJETA, self::METODO_NEQUI, self::METODO_BANCOLOMBIA_QR => self::CATEGORIA_DIGITAL,
            self::METODO_EFECTIVO => self::CATEGORIA_EFECTIVO,
            default => self::CATEGORIA_DIGITAL,
        };
    }

    private function simularProcesamiento(array $datos): array
    {
        $numeroTarjeta = $datos['numero_tarjeta'] ?? '';

        if (! empty($numeroTarjeta)) {
            $prefijosRechazo = ['4000', '5000', '6000'];
            foreach ($prefijosRechazo as $prefijo) {
                if (str_starts_with($numeroTarjeta, $prefijo)) {
                    return [
                        'estado' => self::ESTADO_FALLIDO,
                        'simulado' => true,
                        'mensaje' => 'Pago rechazado (simulado)',
                        'codigo' => 'card_declined',
                    ];
                }
            }
        }

        if (random_int(0, 100) < 5) {
            return [
                'estado' => self::ESTADO_FALLIDO,
                'simulado' => true,
                'mensaje' => 'Error en el procesamiento (simulado)',
                'codigo' => 'processing_error',
            ];
        }

        return [
            'estado' => self::ESTADO_COMPLETADO,
            'simulado' => true,
            'mensaje' => 'Pago aprobado exitosamente',
        ];
    }

    private function actualizarPagoPlan(int $id, array $resultado): array
    {
        $pago = PagoPlan::findOrFail($id);

        $pago->update([
            'estado' => $resultado['estado'],
        ]);

        if ($resultado['estado'] === self::ESTADO_COMPLETADO && $pago->plan) {
            $pago->update([
                'fechaInicioPlan' => now(),
                'fechaFinPlan' => now()->addMonth(),
            ]);

            $usuario = Usuario::find($pago->id_CorreoUsuario);
            if ($usuario) {
                $usuario->id_Plan = $pago->id_Plan;
                $usuario->save();

                $plan = Plan::find($pago->id_Plan);
                $nombrePlan = $plan?->nombre ?? $pago->id_Plan;

                Notificacion::create([
                    'mensaje' => '¡Pago aprobado! Tu plan "'.$nombrePlan.'" está activo. Referencia: '.$pago->referenciaPago,
                    'estado' => 'No leido',
                    'tipo' => 'sistema',
                    'id_CorreoUsuario' => $pago->id_CorreoUsuario,
                ]);
            }
        }

        return [
            'id_pago' => $pago->id_PagoPlan,
            'tipo' => self::TIPO_PLAN,
            'referencia' => $pago->referenciaPago,
            'monto' => $pago->monto,
            'estado' => $pago->estado,
            'mensaje' => $resultado['mensaje'] ?? null,
            'simulado' => $resultado['simulado'] ?? true,
        ];
    }

    private function actualizarPagoServicio(int $id, array $resultado): array
    {
        $pago = PagoServicio::findOrFail($id);

        $pago->update([
            'estado' => $resultado['estado'],
        ]);

        // Si el pago está asociado a una postulación y fue completado,
        // actualizar el estado de la postulación y notificar
        if ($resultado['estado'] === self::ESTADO_COMPLETADO && $pago->id_Postulacion) {
            $postulacion = Postulacion::with(['servicio', 'usuario'])->find($pago->id_Postulacion);

            if ($postulacion && $postulacion->estado !== 'pagada') {
                $postulacion->estado = 'pagada';
                $postulacion->save();

                // Marcar servicio como completado si no hay más postulaciones activas
                if ($postulacion->servicio) {
                    $postulacionesRestantes = Postulacion::where('id_Servicio', $postulacion->servicio->id_Servicio)
                        ->whereNotIn('estado', ['completada', 'pagada', 'rechazada', 'cancelada'])
                        ->count();

                    if ($postulacionesRestantes === 0) {
                        $postulacion->servicio->estado = 'Completado';
                        $postulacion->servicio->save();
                    }
                }

                // Notificar al ofertante que recibió el pago
                if ($postulacion->usuario) {
                    Notificacion::create([
                        'mensaje' => 'Has recibido el pago por "'.$postulacion->servicio?->titulo.'" de $'.number_format($pago->monto, 0, ',', '.').' COP.',
                        'estado' => 'No leido',
                        'tipo' => 'pago',
                        'id_CorreoUsuario' => $postulacion->usuario->id_CorreoUsuario,
                    ]);
                }

                // Notificar al cliente que el pago fue procesado
                Notificacion::create([
                    'mensaje' => 'Tu pago por "'.$postulacion->servicio?->titulo.'" fue procesado exitosamente. Ya puedes dejar una calificación.',
                    'estado' => 'No leido',
                    'tipo' => 'pago',
                    'id_CorreoUsuario' => $pago->id_Pagador,
                ]);
            }
        }

        return [
            'id_pago' => $pago->id_PagoServicio,
            'tipo' => self::TIPO_SERVICIO,
            'referencia' => $pago->referenciaPago,
            'monto' => $pago->monto,
            'estado' => $pago->estado,
            'mensaje' => $resultado['mensaje'] ?? null,
            'simulado' => $resultado['simulado'] ?? true,
        ];
    }
}
