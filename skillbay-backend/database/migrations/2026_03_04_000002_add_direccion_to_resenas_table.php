<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Agrega campo para resenas bidireccionales:
     * - 'cliente_a_ofertante': Cliente resena al ofertante
     * - 'ofertante_a_cliente': Ofertante resena al cliente
     */
    public function up(): void
    {
        // Consolidado en 2026_03_05_000006_add_fields_to_resenas_table.php
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropForeign(['id_Postulacion']);
            $table->dropColumn(['direccion', 'id_Postulacion']);
        });
    }
};
