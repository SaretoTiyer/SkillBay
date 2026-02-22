<?php

namespace App\Services;

use Illuminate\Support\Str;

/**
 * Servicio simulador de MercadoPago para tests y entornos educativos.
 *
 * Simula todas las respuestas de la API de MercadoPago sin hacer llamadas reales.
 * Útil para:
 * - Tests unitarios y de integración
 * - Entornos de desarrollo sin credenciales reales
 * - Proyectos educativos
 *
 * Uso en tests:
 *   $this->app->bind(MercadoPagoInterface::class, MercadoPagoSimuladorService::class);
 */
class MercadoPagoSimuladorService implements MercadoPagoInterface
{
    /**
     * Estado simulado para el próximo pago (para controlar en tests).
     * Valores: 'approved', 'pending', 'rejected', 'cancelled'
     */
    private static string $estadoSimulado = 'approved';

    /**
     * Configura el estado que devolverá el simulador.
     */
    public static function simularEstado(string $estado): void
    {
        self::$estadoSimulado = $estado;
    }

    /**
     * Simula la creación de una preferencia de pago en MercadoPago.
     * Retorna datos ficticios sin llamar a la API real.
     */
    public function crearPreferencia(array $datos): array
    {
        $preferenceId = 'SIM-PREF-' . strtoupper(Str::random(12));
        $externalRef  = $datos['external_reference'] ?? 'SIM-REF-' . uniqid();

        return [
            'id'                 => $preferenceId,
            'init_point'         => 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=' . $preferenceId,
            'sandbox_init_point' => 'https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=' . $preferenceId,
            'external_reference' => $externalRef,
            'items'              => $datos['items'] ?? [],
            'payer'              => $datos['payer'] ?? [],
            'back_urls'          => $datos['back_urls'] ?? [],
            'simulado'           => true,
        ];
    }

    /**
     * Simula la obtención de un pago por ID.
     * Retorna datos ficticios con el estado configurado.
     */
    public function obtenerPago(int $paymentId): array
    {
        return [
            'id'                 => $paymentId,
            'status'             => self::$estadoSimulado,
            'external_reference' => 'SIM-REF-' . $paymentId,
            'transaction_amount' => 15000.00,
            'payer'              => [
                'email' => 'test@skillbay.test',
            ],
            'simulado'           => true,
        ];
    }

    /**
     * Simula un pago con referencia externa específica.
     */
    public function obtenerPagoPorReferencia(string $referencia): array
    {
        return [
            'id'                 => rand(100000, 999999),
            'status'             => self::$estadoSimulado,
            'external_reference' => $referencia,
            'transaction_amount' => 15000.00,
            'simulado'           => true,
        ];
    }
}
