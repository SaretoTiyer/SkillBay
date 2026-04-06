<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Este campo diferencia el tipo de postulación:
     * - 'postulante': El usuario aplica a una oportunidad publicada por un cliente
     *                 → El cliente paga al postulante (flujo normal)
     * - 'solicitante': El usuario solicita un servicio a un ofertante
     *                 → El solicitante paga al proveedor/ofertante
     */
    public function up(): void
    {
        Schema::table('postulaciones', function (Blueprint $table) {
            $table->enum('tipo_postulacion', ['postulante', 'solicitante'])->default('postulante')->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('postulaciones', function (Blueprint $table) {
            $table->dropColumn('tipo_postulacion');
        });
    }
};
