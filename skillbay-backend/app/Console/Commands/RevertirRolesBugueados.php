<?php

namespace App\Console\Commands;

use App\Models\Postulacion;
use App\Models\Resena;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Console\Command;

class RevertirRolesBugueados extends Command
{
    protected $signature = 'usuarios:revertir-roles-bugueados {--dry-run : Simular la reversión sin hacer cambios}';

    protected $description = 'Revierte el rol de usuarios que fueron cambiados a ofertante incorrectamente por el bug';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 MODO DRY-RUN - No se realizarán cambios');
        }

        $this->info('🔍 Identificando usuarios afectados por el bug...');

        $usuariosAfectados = Usuario::where('rol', 'ofertante')
            ->whereNotExists(function ($query) {
                $query->selectRaw(1)
                    ->from('servicios')
                    ->whereRaw('servicios.id_Cliente = usuarios.id_CorreoUsuario');
            })
            ->whereNotExists(function ($query) {
                $query->selectRaw(1)
                    ->from('postulaciones')
                    ->whereRaw('postulaciones.id_Usuario = usuarios.id_CorreoUsuario')
                    ->where('postulaciones.estado', 'aceptada');
            })
            ->whereExists(function ($query) {
                $query->selectRaw(1)
                    ->from('resenas')
                    ->whereRaw('resenas.id_CorreoUsuario = usuarios.id_CorreoUsuario');
            })
            ->get();

        $this->info("📋 Usuarios encontrados: {$usuariosAfectados->count()}");

        if ($usuariosAfectados->isEmpty()) {
            $this->info('✅ No hay usuarios que revertir');

            return Command::SUCCESS;
        }

        $revertidos = 0;

        foreach ($usuariosAfectados as $usuario) {
            $resenasCount = Resena::where('id_CorreoUsuario', $usuario->id_CorreoUsuario)->count();
            $serviciosCount = Servicio::where('id_Cliente', $usuario->id_CorreoUsuario)->count();
            $postulacionesAceptadasCount = Postulacion::where('id_Usuario', $usuario->id_CorreoUsuario)
                ->where('estado', 'aceptada')
                ->count();

            if ($dryRun) {
                $this->line("  📝 {$usuario->id_CorreoUsuario}");
                $this->line("      Resenas: {$resenasCount} | Servicios: {$serviciosCount} | Postulaciones aceptadas: {$postulacionesAceptadasCount}");
                $this->line("      → CAMBIARÍA rol a 'cliente'");
            } else {
                $usuario->rol = 'cliente';
                $usuario->save();
                $this->line("  ✅ {$usuario->id_CorreoUsuario} revertido a 'cliente'");
            }

            $revertidos++;
        }

        $this->info("✅ Resumen: {$revertidos} usuarios afectados");

        if ($dryRun) {
            $this->info('🔍 Ejecute sin --dry-run para aplicar los cambios');
        }

        return Command::SUCCESS;
    }
}
