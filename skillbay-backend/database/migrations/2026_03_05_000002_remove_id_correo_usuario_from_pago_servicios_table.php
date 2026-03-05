<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Elimina el campo redundante id_CorreoUsuario de pago_servicios.
     * 
     * El campo id_CorreoUsuario era redundante porque:
     * 1. El usuario que paga ya está representado por id_Cliente
     * 2. El usuario que recibe ya está representado por id_Prestador
     * 3. Se puede obtener información del usuario a través de las relaciones
     *    con Servicio y Postulación
     */
    public function up(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            // Primero eliminar la foreign key
            $table->dropForeign(['id_CorreoUsuario']);
            
            // Luego eliminar la columna
            $table->dropColumn('id_CorreoUsuario');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->string('id_CorreoUsuario', 191)->nullable()->after('id_Postulacion');
            $table->foreign('id_CorreoUsuario')->references('id_CorreoUsuario')->on('usuarios')->nullOnDelete();
        });
    }
};
