<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('usuarios')
            ->whereNull('created_at')
            ->whereNotNull('fechaRegistro')
            ->update([
                'created_at' => DB::raw('fechaRegistro'),
                'updated_at' => DB::raw('fechaRegistro'),
            ]);

        DB::table('usuarios')
            ->whereNull('created_at')
            ->whereNull('fechaRegistro')
            ->update([
                'created_at' => now(),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // No es necesario revertir - los datos históricos se pierden
    }
};
