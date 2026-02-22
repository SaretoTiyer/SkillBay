<?php

namespace App\Services;

interface MercadoPagoInterface
{
  public function crearPreferencia(array $datos): array;
  public function obtenerPago(int $paymentId): array;
  public function obtenerPagoPorReferencia(string $referencia): array;
}