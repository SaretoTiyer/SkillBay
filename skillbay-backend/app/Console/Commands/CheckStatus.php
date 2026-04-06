<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CheckStatus extends Command
{
    protected $signature = 'status:check';

    protected $description = 'Verifica el estado de conexion de todos los servicios del sistema';

    private $ok = '✅';

    private $fail = '❌';

    private $warn = '⚠️';

    public function handle()
    {
        $this->newLine();
        $this->line('  <fg=blue;options=bold>╔══════════════════════════════════════════════════════╗</>');
        $this->line('  <fg=blue;options=bold>║</>         <fg=yellow;options=bold>SkillBay - Estado del Sistema</>             <fg=blue;options=bold>║</>');
        $this->line('  <fg=blue;options=bold>╚══════════════════════════════════════════════════════╝</>');
        $this->newLine();

        $this->checkDatabase();
        $this->checkStorage();
        $this->checkEnv();
        $this->checkMail();
        $this->checkCache();
        $this->checkQueues();
        $this->checkPlaceholders();
        $this->checkMigrations();

        $this->newLine();
        $this->line('  <fg=blue;options=bold>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</>');
        $this->newLine();
    }

    private function checkDatabase()
    {
        $this->line('  <fg=cyan;options=bold>📦 Base de Datos</>');

        try {
            $pdo = DB::connection()->getPdo();
            $dbName = DB::connection()->getDatabaseName();
            $this->line("     {$this->ok}  Conexion: <fg=green>Exitosa</>");
            $this->line("     {$this->ok}  Base de datos: <fg=gray>{$dbName}</>");

            $tables = DB::select('SHOW TABLES');
            $tableCount = count($tables);
            $this->line("     {$this->ok}  Tablas: <fg=gray>{$tableCount} encontradas</>");
        } catch (\Exception $e) {
            $this->line("     {$this->fail}  Conexion: <fg=red>Fallida</>");
            $this->line("     <fg=red>     Error: {$e->getMessage()}</>");
        }

        $this->newLine();
    }

    private function checkStorage()
    {
        $this->line('  <fg=cyan;options=bold>💾 Almacenamiento</>');

        $publicStorage = public_path('storage');
        if (File::exists($publicStorage)) {
            $this->line("     {$this->ok}  Symlink storage: <fg=green>Existe</>");
        } else {
            $this->line("     {$this->fail}  Symlink storage: <fg=red>No existe</>");
            $this->line('     <fg=yellow>     Ejecuta: php artisan storage:link</>');
        }

        $writable = is_writable(storage_path('app'));
        $this->line("     {$this->ok}  Directorio storage: <fg=green>".($writable ? 'Escribible' : 'No escribible').'</>');

        $this->newLine();
    }

    private function checkEnv()
    {
        $this->line('  <fg=cyan;options=bold>⚙️  Configuracion</>');

        $appEnv = config('app.env');
        $appDebug = config('app.debug');
        $this->line("     {$this->ok}  Entorno: <fg=gray>{$appEnv}</>");
        $this->line("     {$this->ok}  Debug: <fg=gray>".($appDebug ? 'Activado' : 'Desactivado').'</>');

        $key = config('app.key');
        if ($key) {
            $this->line("     {$this->ok}  APP_KEY: <fg=green>Configurado</>");
        } else {
            $this->line("     {$this->fail}  APP_KEY: <fg=red>No configurado</>");
        }

        $this->newLine();
    }

    private function checkMail()
    {
        $this->line('  <fg=cyan;options=bold>📧 Correo Electronico</>');

        $mailer = config('mail.mailers.'.config('mail.default'));
        if ($mailer) {
            $this->line("     {$this->ok}  Mailer: <fg=gray>".config('mail.default').'</>');
            if (config('mail.default') === 'smtp') {
                $host = config('mail.mailers.smtp.host');
                $this->line("     {$this->ok}  Host SMTP: <fg=gray>{$host}</>");
            }
        } else {
            $this->line("     {$this->warn}  Mailer: <fg=yellow>No configurado</>");
        }

        $this->newLine();
    }

    private function checkCache()
    {
        $this->line('  <fg=cyan;options=bold>🗄️  Cache</>');

        try {
            cache()->put('status_check', true, 10);
            $result = cache()->get('status_check');
            if ($result) {
                $this->line("     {$this->ok}  Cache: <fg=green>Funcional</>");
                cache()->forget('status_check');
            } else {
                $this->line("     {$this->fail}  Cache: <fg=red>No responde</>");
            }
        } catch (\Exception $e) {
            $this->line("     {$this->fail}  Cache: <fg=red>Error - {$e->getMessage()}</>");
        }

        $this->newLine();
    }

    private function checkQueues()
    {
        $this->line('  <fg=cyan;options=bold>🔄 Cola de Trabajos</>');

        $queueDriver = config('queue.default');
        $this->line("     {$this->ok}  Driver: <fg=gray>{$queueDriver}</>");

        if ($queueDriver === 'database') {
            try {
                $pending = DB::table('jobs')->count();
                $failed = DB::table('failed_jobs')->count();
                $this->line("     {$this->ok}  Trabajos pendientes: <fg=gray>{$pending}</>");
                $this->line("     {$this->ok}  Trabajos fallidos: <fg=gray>{$failed}</>");
            } catch (\Exception $e) {
                $this->line("     {$this->warn}  No se pudo verificar la tabla de jobs</>");
            }
        }

        $this->newLine();
    }

    private function checkPlaceholders()
    {
        $this->line('  <fg=cyan;options=bold>🖼️  Imagenes Placeholder</>');

        $placeholderDir = storage_path('app/public/placeholders');
        if (File::exists($placeholderDir)) {
            $files = File::files($placeholderDir);
            $this->line("     {$this->ok}  Directorio: <fg=green>Existe</>");
            $this->line("     {$this->ok}  Imagenes: <fg=gray>".count($files).' generadas</>');
        } else {
            $this->line("     {$this->warn}  Directorio: <fg=yellow>No existe</>");
            $this->line('     <fg=yellow>     Ejecuta: php artisan status:generate-placeholders</>');
        }

        $this->newLine();
    }

    private function checkMigrations()
    {
        $this->line('  <fg=cyan;options=bold>📋 Migraciones</>');

        try {
            $ran = DB::table('migrations')->count();
            $this->line("     {$this->ok}  Migraciones ejecutadas: <fg=gray>{$ran}</>");
        } catch (\Exception $e) {
            $this->line("     {$this->fail}  Migraciones: <fg=red>No se pudo verificar</>");
        }

        $this->newLine();
    }
}
