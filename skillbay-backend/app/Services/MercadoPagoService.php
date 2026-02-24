<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Interfaz para servicios de pago de MercadoPago.
 *
 * Permite implementar servicios reales o simulados para testing.
 */
interface MercadoPagoInterface
{
    /**
     * Crea una preferencia de pago en MercadoPago.
     *
     * @param array $datos Datos del ítem, pagador y URLs de retorno
     * @return array Respuesta con preference_id, init_point, sandbox_init_point
     * @throws \Exception Si falla la comunicación con MP
     */
    public function crearPreferencia(array $datos): array;

    /**
     * Obtiene los datos de un pago por su ID.
     *
     * @param int $paymentId ID del pago en MercadoPago
     * @return array Datos del pago (status, external_reference, etc.)
     * @throws \Exception Si falla la comunicación con MP
     */
    public function obtenerPago(int $paymentId): array;

    /**
     * Obtiene los datos de un pago por su referencia externa.
     *
     * @param string $referencia Referencia externa del pago
     * @return array Datos del pago (status, external_reference, etc.)
     * @throws \Exception Si falla la comunicación con MP
     */
    public function obtenerPagoPorReferencia(string $referencia): array;
}

/**
 * Servicio de MercadoPago.
 *
 * En producción, usa el SDK real de MercadoPago.
 * En tests, puede ser mockeado o reemplazado por MercadoPagoSimuladorService.
 */
class MercadoPagoService implements MercadoPagoInterface
{
    /**
     * Configura el SDK de MercadoPago con las credenciales necesarias.
     */
    private function configurarSdk(): void
    {
        $accessToken = config('services.mercadopago.access_token');
        
        // Configurar el token de acceso
        \MercadoPago\MercadoPagoConfig::setAccessToken($accessToken);
        
        // En entorno local (desarrollo), deshabilitar verificación SSL si hay problemas de certificado
        // Esto es solo para desarrollo - en producción debe estar habilitado
        if (app()->environment('local')) {
            // Deshabilitar verificación SSL para llamadas HTTP
            // Esto resuelve el problema "SSL certificate problem: unable to get local issuer certificate"
            putenv('CURL_CA_BUNDLE=');
            
            // También configurar opciones de contexto de stream para llamadas HTTPS
            $options = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ],
            ];
            stream_context_set_default($options);
            
            Log::info('MercadoPago: Verificación SSL deshabilitada para desarrollo');
        }
        
        Log::info('MercadoPago: SDK configurado', [
            'token_prefix' => substr($accessToken, 0, 7),
            'environment' => app()->environment(),
        ]);
    }

    /**
     * Crea una preferencia de pago en MercadoPago.
     *
     * @param array $datos Datos del ítem, pagador y URLs de retorno
     * @return array Respuesta con preference_id, init_point, sandbox_init_point
     * @throws \Exception Si falla la comunicación con MP
     */
    public function crearPreferencia(array $datos): array
    {
        try {
            // Configurar el SDK de MercadoPago
            $this->configurarSdk();

            // Log de la peticion
            Log::info('MercadoPago: Creando preferencia', [
                'items' => $datos['items'] ?? [],
                'external_reference' => $datos['external_reference'] ?? null,
                'currency_id' => $datos['items'][0]['currency_id'] ?? 'COP',
                'notification_url' => $datos['notification_url'] ?? null,
            ]);

            $client = new \MercadoPago\Client\Preference\PreferenceClient();
            $preference = $client->create($datos);

            Log::info('MercadoPago: Preferencia creada exitosamente', [
                'preference_id' => $preference->id,
            ]);

            return [
                'id'                  => $preference->id,
                'init_point'          => $preference->init_point,
                'sandbox_init_point'  => $preference->sandbox_init_point,
            ];
        } catch (\Throwable $e) {
            // Capturar cualquier error y registrar detalles
            $errorDetails = [
                'message' => $e->getMessage(),
                'exception_class' => get_class($e),
                'items' => $datos['items'] ?? [],
                'external_reference' => $datos['external_reference'] ?? null,
            ];
            
            // Si es una exception de API de MP, obtener mas detalles
            // El SDK de MercadoPago puede lanzar excepciones con getApiResponse()
            // Usamos call_user_func para evitar el warning del IDE sobre métodos del SDK
            $apiResponse = null;
            if (method_exists($e, 'getApiResponse')) {
                $apiResponse = call_user_func([$e, 'getApiResponse']);
            }
            
            if ($apiResponse) {
                $errorDetails['api_response'] = [
                    'status' => is_object($apiResponse) && method_exists($apiResponse, 'getStatusCode') ? (@$apiResponse->getStatusCode() ?? 'unknown') : 'unknown',
                    'body' => is_object($apiResponse) && method_exists($apiResponse, 'getContent') ? (@$apiResponse->getContent() ?? 'unknown') : 'unknown',
                ];
            }
            
            // También intentar obtener el response del SDK de otra forma
            if (isset($e->response) && is_object($e->response)) {
                $errorDetails['sdk_response'] = [
                    'status' => is_object($e->response) && method_exists($e->response, 'getStatusCode') ? (@$e->response->getStatusCode() ?? 'unknown') : 'unknown',
                    'content' => is_object($e->response) && method_exists($e->response, 'getContent') ? (json_decode(@$e->response->getContent(), true) ?? 'unknown') : 'unknown',
                ];
            }
            
            $this->logError('Error al crear preferencia', $errorDetails);
            
            throw new \Exception('Api error. Check response for details: ' . $e->getMessage());
        }
    }

    /**
     * Obtiene los datos de un pago por su ID.
     *
     * @param int $paymentId ID del pago en MercadoPago
     * @return array Datos del pago (status, external_reference, etc.)
     * @throws \Exception Si falla la comunicación con MP
     */
    public function obtenerPago(int $paymentId): array
    {
        try {
            $this->configurarSdk();

            Log::info('MercadoPago: Obteniendo pago', ['payment_id' => $paymentId]);

            $client = new \MercadoPago\Client\Payment\PaymentClient();
            $payment = $client->get($paymentId);

            return [
                'id'                 => $payment->id,
                'status'             => $payment->status,
                'external_reference' => $payment->external_reference,
                'transaction_amount' => $payment->transaction_amount,
                'payer'              => $payment->payer ?? null,
            ];
        } catch (\Throwable $e) {
            $this->logError('Error al obtener pago', [
                'message' => $e->getMessage(),
                'exception_class' => get_class($e),
                'payment_id' => $paymentId,
            ]);
            
            throw new \Exception('Api error. Check response for details: ' . $e->getMessage());
        }
    }
    
    /**
     * Metodo helper para registrar errores de manera consistente
     */
    private function logError(string $message, array $context): void
    {
        Log::error('MercadoPago: ' . $message, $context);
    }

    /**
     * Obtiene los datos de un pago por su referencia externa.
     *
     * @param string $referencia Referencia externa del pago
     * @return array Datos del pago (status, external_reference, etc.)
     * @throws \Exception Si falla la comunicación con MP
     */
    public function obtenerPagoPorReferencia(string $referencia): array
    {
        try {
            $this->configurarSdk();

            Log::info('MercadoPago: Obteniendo pago por referencia', ['external_reference' => $referencia]);

            // Usar el cliente de preferencias para buscar por external_reference
            /** @var \MercadoPago\Client\Preference\PreferenceClient $client */
            $client = new \MercadoPago\Client\Preference\PreferenceClient();
            
            // Buscar preferencias por external_reference
            // Usamos call_user_func para evitar el warning del IDE sobre métodos del SDK
            /** @var object|false $preferences */
            $preferences = call_user_func([$client, 'list'], [
                'external_reference' => $referencia,
                'limit' => 1,
            ]);

            // Si encontramos preferencias, buscar el pago asociado
            // La respuesta del SDK puede tener diferentes estructuras
            $results = is_object($preferences) ? (@$preferences->results ?? @$preferences->response ?? []) : [];
            if (!empty($results) && is_array($results) && count($results) > 0) {
                $preference = is_array($results[0]) ? (object)$results[0] : $results[0];
                
                // Obtener el primer pago de la preferencia
                if (!empty($preference->id)) {
                    return [
                        'preference_id' => $preference->id,
                        'external_reference' => $preference->external_reference ?? $referencia,
                        'status' => $preference->status ?? 'unknown',
                        'init_point' => $preference->init_point ?? null,
                    ];
                }
            }

            return [
                'external_reference' => $referencia,
                'status' => 'not_found',
            ];
        } catch (\Throwable $e) {
            $this->logError('Error al obtener pago por referencia', [
                'message' => $e->getMessage(),
                'exception_class' => get_class($e),
                'external_reference' => $referencia,
            ]);
            
            throw new \Exception('Api error. Check response for details: ' . $e->getMessage());
        }
    }
}
