<?php

namespace App\Console\Commands;

use App\Models\Resena;
use Illuminate\Console\Command;

class PopulateResenaRol extends Command
{
    protected $signature = 'resenas:populate-rol-calificado {--dry-run : Simular sin hacer cambios}';

    protected $description = 'Migra datos históricos de rol_calificado en reseñas';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('MODO DRY-RUN - No se realizarán cambios');
        }

        $this->info('Iniciando migración de rol_calificado...');

        $resenasSinRol = Resena::whereNull('rol_calificado')
            ->with(['servicio', 'postulacion'])
            ->get();

        $this->info("Reseñas sin rol_calificado: {$resenasSinRol->count()}");

        if ($resenasSinRol->isEmpty()) {
            $this->info('No hay reseñas que migrar');

            return Command::SUCCESS;
        }

        $procesadas = 0;
        $errores = 0;

        foreach ($resenasSinRol as $resena) {
            $servicio = $resena->servicio;
            if (! $servicio) {
                $this->warn("Reseña {$resena->id} sin servicio -saltando");

                continue;
            }

            $calificado = $resena->id_CorreoUsuario_Calificado;
            if (! $calificado) {
                $this->warn("Reseña {$resena->id} sin calificado -saltando");
                $errores++;

                continue;
            }

            $rol = $this->determinarRol($servicio, $calificado, $resena->postulacion);

            if (! $rol) {
                $this->warn("Reseña {$resena->id} -no se pudo determinar el rol");
                $errores++;

                continue;
            }

            if ($dryRun) {
                $this->line("Reseña {$resena->id}: calificador={$resena->id_CorreoUsuario} → calificado={$calificado} = {$rol}");
            } else {
                $resena->rol_calificado = $rol;
                $resena->save();
            }

            $procesadas++;
        }

        $this->info("Procesadas: {$procesadas}, Errores: {$errores}");

        if ($dryRun) {
            $this->info('Ejecutar sin --dry-run para aplicar');
        }

        return Command::SUCCESS;
    }

    private function determinarRol($servicio, $calificado, $postulacion): ?string
    {
        if ($servicio->tipo === 'servicio') {
            if ($calificado === $servicio->id_Cliente) {
                return 'ofertante';
            }

            return 'cliente';
        }

        if ($servicio->tipo === 'oportunidad') {
            if ($postulacion && $postulacion->id_Usuario === $calificado && $postulacion->tipo_postulacion === 'postionante') {
                return 'ofertante';
            }

            return 'cliente';
        }

        return null;
    }
}
