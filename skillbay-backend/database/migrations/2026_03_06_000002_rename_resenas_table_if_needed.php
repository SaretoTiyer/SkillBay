<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Renombra la tabla si existe con el nombre viejo (con caracter especial)
        $tables = DB::select("SHOW TABLES");
        $tableNames = array_map(fn($t) => array_values((array)$t)[0], $tables);

        if (in_array('reseñas', $tableNames) && !in_array('resenas', $tableNames)) {
            DB::statement('RENAME TABLE `reseñas` TO `resenas`');
        }
    }

    public function down(): void
    {
        // No se revierte
    }
};