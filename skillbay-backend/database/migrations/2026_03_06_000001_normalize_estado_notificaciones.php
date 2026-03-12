<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('notificaciones')
            ->whereIn('estado', ['No leído', 'No_leido'])
            ->update(['estado' => 'No leido']);
    }

    public function down(): void
    {
        // No se revierte: normalización de datos es unidireccional
    }
};
