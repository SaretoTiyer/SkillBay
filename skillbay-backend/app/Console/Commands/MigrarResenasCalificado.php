<?php

namespace App\Console\Commands;

use App\Models\Postulacion;
use App\Models\Resena;
use App\Models\Servicio;
use Illuminate\Console\Command;

class MigrarResenasCalificado extends Command
{
    protected $signature = 'resenas:migrar-calificado {--dry-run : Simular la migración sin hacer cambios}';

    protected $description = 'Migra los datos históricos de reseñas para populate id_CorreoUsuario_Calificado';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 MODO DRY-RUN - No se realizarán cambios');
        }

        $this->info('📊 Iniciando migración de reseñas...');

        $resenasSinCalificado = Resena::whereNull('id_CorreoUsuario_Calificado')
            ->with(['servicio', 'postulacion'])
            ->get();

        $this->info("📋 Reseñas sin id_CorreoUsuario_Calificado: {$resenasSinCalificado->count()}");

        if ($resenasSinCalificado->isEmpty()) {
            $this->info('✅ No hay reseñas que migrar');

            return Command::SUCCESS;
        }

        $procesadas = 0;
        $errores = 0;
        $erroresDetallados = [];

        foreach ($resenasSinCalificado as $resena) {
            $servicio = $resena->servicio;

            if (! $servicio) {
                $this->warn("⚠️ Reseña ID {$resena->id} sin servicio - seaignora");
                if (! $dryRun) {
                    $resena->id_CorreoUsuario_Calificado = null;
                    $resena->save();
                }

                continue;
            }

            $calificado = $this->determinarCalificado($servicio, $resena->postulacion);

            if (! $calificado) {
                $this->warn("⚠️ Reseña ID {$resena->id} - No se pudo determinar el calificado para servicio tipo '{$servicio->tipo}'");
                $errores++;
                $erroresDetallados[] = [
                    'resena_id' => $resena->id,
                    'servicio_tipo' => $servicio->tipo,
                    'id_Cliente' => $servicio->id_Cliente,
                    'postulacion_id' => $resena->id_Postulacion,
                ];

                continue;
            }

            if ($dryRun) {
                $this->line("  📝 Reseña ID {$resena->id}: calificador={$resena->id_CorreoUsuario} → calificado={$calificado}");
            } else {
                $resena->id_CorreoUsuario_Calificado = $calificado;
                $resena->save();
            }

            $procesadas++;
        }

        $this->info('✅ Resumen:');
        $this->info("   - Procesadas: {$procesadas}");
        $this->info("   - Errores: {$errores}");

        if ($errores > 0) {
            $this->warn("⚠️ {$errores} reseñas no pudieron ser procesadas:");
            foreach (array_slice($erroresDetallados, 0, 10) as $error) {
                $this->line("   - Resena #{$error['resena_id']}: tipo={$error['servicio_tipo']}, postulacion={$error['postulacion_id']}");
            }
            if (count($erroresDetallados) > 10) {
                $this->line('   ... y '.(count($erroresDetallados) - 10).' más');
            }
        }

        if ($dryRun) {
            $this->info('🔍 Ejecute sin --dry-run para aplicar los cambios');
        }

        return Command::SUCCESS;
    }

    private function determinarCalificado(?Servicio $servicio, ?Postulacion $postulacion): ?string
    {
        if (! $servicio) {
            return null;
        }

        if ($servicio->tipo === 'servicio') {
            return $servicio->id_Cliente;
        }

        if ($servicio->tipo === 'oportunidad') {
            if ($postulacion && $postulacion->id_Usuario) {
                return $postulacion->id_Usuario;
            }

            $postulacionReciente = Postulacion::where('id_Servicio', $servicio->id_Servicio)
                ->orderBy('created_at', 'desc')
                ->first();

            return $postulacionReciente?->id_Usuario;
        }

        return null;
    }
}
