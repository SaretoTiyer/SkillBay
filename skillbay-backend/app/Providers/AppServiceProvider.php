<?php

namespace App\Providers;

use App\Services\MercadoPagoInterface;
use App\Services\MercadoPagoService;
use App\Services\MercadoPagoSimuladorService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind MercadoPagoInterface al servicio correspondiente segun el entorno
        $this->app->bind(MercadoPagoInterface::class, function ($app) {
            // En testing, usar simulador
            if ($app->environment('testing')) {
                Log::info('MercadoPago: Usando simulador (entorno testing)');
                return new MercadoPagoSimuladorService();
            }
            
            // Verificar si el token de acceso es valido
            $accessToken = config('services.mercadopago.access_token');
            
            // Si no hay token o contiene placeholders, usar simulador
            if (empty($accessToken) || $this->isTokenInvalido($accessToken)) {
                Log::warning('MercadoPago: Token de acceso invalido o no configurado. Usando simulador.');
                return new MercadoPagoSimuladorService();
            }
            
            // En entorno local (desarrollo), usar simulador por defecto para evitar errores de API
            // a menos que se configure explicitamente MP_USE_SIMULATOR=false
            if ($app->environment('local') && env('MP_USE_SIMULATOR', true)) {
                Log::info('MercadoPago: Usando simulador (entorno local)');
                return new MercadoPagoSimuladorService();
            }
            
            Log::info('MercadoPago: Usando servicio real');
            return new MercadoPagoService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
    }
    
    /**
     * Verifica si el token de MercadoPago es invalido (placeholder o dummy)
     */
    private function isTokenInvalido(string $token): bool
    {
        // Tokens de prueba con placeholders
        $invalidPatterns = [
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'TEST-0000000000000000-000000-',
            'your_access_token_here',
            'YOUR_ACCESS_TOKEN',
        ];
        
        foreach ($invalidPatterns as $pattern) {
            if (str_contains($token, $pattern)) {
                return true;
            }
        }
        
        // Token vacio o muy corto
        if (strlen($token) < 20) {
            return true;
        }
        
        return false;
    }
}
