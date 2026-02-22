<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'mysql') {
            // MySQL: modificar la columna ENUM para agregar 'en_progreso' y 'completada'
            DB::statement("ALTER TABLE postulaciones MODIFY estado ENUM('pendiente','aceptada','rechazada','cancelada','en_progreso','completada') NOT NULL DEFAULT 'pendiente'");
        }
        // SQLite: los ENUMs son solo texto, no se necesita modificar
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE postulaciones MODIFY estado ENUM('pendiente','aceptada','rechazada','cancelada') NOT NULL DEFAULT 'pendiente'");
        }
    }
};
