<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Elimina la columna id_Contratista de la tabla servicios.
     *
     * Esta columna fue definida en la migración original (2025_11_13_031203) pero
     * nunca fue utilizada en ningún controlador ni modelo del sistema.
     * La relación "contratista seleccionado" se gestiona a través de la tabla
     * postulaciones (estado = 'aceptada'), no mediante este campo redundante.
     */
    public function up(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            // Eliminar la foreign key antes de eliminar la columna
            $table->dropForeign(['id_Contratista']);
            $table->dropColumn('id_Contratista');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->string('id_Contratista', 191)->nullable()->after('id_Cliente');
            $table->foreign('id_Contratista')->references('id_CorreoUsuario')->on('usuarios')->onDelete('set null');
        });
    }
};
