<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Renombra las columnas en pago_servicios para eliminar la ambigüedad semántica
     * con la columna id_Cliente de la tabla servicios:
     *
     * - id_Cliente  → id_Pagador  (quien transfiere el dinero)
     * - id_Prestador → id_Receptor (quien recibe el dinero)
     *
     * Esto evita confusión con servicios.id_Cliente que representa al dueño/publicador
     * del servicio, mientras que pago_servicios.id_Pagador representa al usuario
     * que efectúa el pago en una transacción específica.
     */
    public function up(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            // Primero eliminar las foreign keys existentes
            $table->dropForeign(['id_Cliente']);
            $table->dropForeign(['id_Prestador']);

            // Renombrar las columnas
            $table->renameColumn('id_Cliente', 'id_Pagador');
            $table->renameColumn('id_Prestador', 'id_Receptor');
        });

        // Recrear las foreign keys con los nuevos nombres
        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->foreign('id_Pagador')->references('id_CorreoUsuario')->on('usuarios')->onDelete('set null');
            $table->foreign('id_Receptor')->references('id_CorreoUsuario')->on('usuarios')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->dropForeign(['id_Pagador']);
            $table->dropForeign(['id_Receptor']);

            $table->renameColumn('id_Pagador', 'id_Cliente');
            $table->renameColumn('id_Receptor', 'id_Prestador');
        });

        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->foreign('id_Cliente')->references('id_CorreoUsuario')->on('usuarios')->onDelete('set null');
            $table->foreign('id_Prestador')->references('id_CorreoUsuario')->on('usuarios')->onDelete('set null');
        });
    }
};
