<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);

        // Azure App Service termina SSL en el load balancer y reenvía las
        // requests al contenedor por HTTP interno. Forzar HTTPS asegura que
        // asset(), url() y Storage::url() generen URLs correctas.
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}
