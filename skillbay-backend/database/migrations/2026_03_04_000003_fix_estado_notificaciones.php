<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Corrige el problema de tildes en el estado de notificaciones
     * - 'No leído' → 'No_leido'
     * - 'Leido' (si existe) → 'Leido'
     */
    public function up(): void
    {
        // Actualizar valores con tilde a valores sin tilde
        DB::table('notificaciones')
            ->where('estado', 'No leído')
            ->update(['estado' => 'No_leido']);
        
        DB::table('notificaciones')
            ->where('estado', 'Leído')
            ->update(['estado' => 'Leido']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir valores sin tilde a valores con tilde
        DB::table('notificaciones')
            ->where('estado', 'No_leido')
            ->update(['estado' => 'No leído']);
        
        DB::table('notificaciones')
            ->where('estado', 'Leido')
            ->update(['estado' => 'Leído']);
    }
};
