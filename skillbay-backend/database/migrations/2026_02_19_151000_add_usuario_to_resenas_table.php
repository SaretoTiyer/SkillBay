<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Consolidado en 2026_03_05_000006_add_fields_to_resenas_table.php
    }

    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropColumn('id_CorreoUsuario');
        });
    }
};
