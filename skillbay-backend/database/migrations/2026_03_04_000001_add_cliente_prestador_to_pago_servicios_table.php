<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Agrega campos para identificar claramente quién paga y quién recibe en cada transacción
     */
    public function up(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            // Cliente: quien paga el servicio
            $table->string('id_Cliente', 255)->nullable()->after('id_CorreoUsuario');

            // Prestador: quien recibe el pago por el trabajo realizado
            $table->string('id_Prestador', 255)->nullable()->after('id_Cliente');

            // Agregar foreign keys
            $table->foreign('id_Cliente')->references('id_CorreoUsuario')->on('usuarios')->onDelete('set null');
            $table->foreign('id_Prestador')->references('id_CorreoUsuario')->on('usuarios')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->dropForeign(['id_Cliente']);
            $table->dropForeign(['id_Prestador']);
            $table->dropColumn(['id_Cliente', 'id_Prestador']);
        });
    }
};
