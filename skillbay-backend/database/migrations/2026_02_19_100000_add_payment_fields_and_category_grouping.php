<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->string('grupo', 120)->nullable()->after('nombre');
        });

        Schema::table('pago_planes', function (Blueprint $table) {
            $table->string('referenciaPago', 80)->nullable()->unique()->after('metodoPago');
            $table->string('modalidadPago', 20)->nullable()->after('referenciaPago');
        });

        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->string('referenciaPago', 80)->nullable()->unique()->after('metodoPago');
            $table->string('modalidadPago', 20)->nullable()->after('referenciaPago');
            $table->string('modalidadServicio', 20)->nullable()->after('modalidadPago');
            $table->string('identificacionCliente', 40)->nullable()->after('modalidadServicio');
            $table->string('origenSolicitud', 20)->nullable()->after('identificacionCliente');
            $table->unsignedBigInteger('id_Postulacion')->nullable()->after('origenSolicitud');
            $table->string('id_CorreoUsuario', 191)->nullable()->after('id_Postulacion');

            $table->foreign('id_Postulacion')->references('id')->on('postulaciones')->nullOnDelete();
            $table->foreign('id_CorreoUsuario')->references('id_CorreoUsuario')->on('usuarios')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->dropForeign(['id_Postulacion']);
            $table->dropForeign(['id_CorreoUsuario']);
            $table->dropColumn([
                'referenciaPago',
                'modalidadPago',
                'modalidadServicio',
                'identificacionCliente',
                'origenSolicitud',
                'id_Postulacion',
                'id_CorreoUsuario',
            ]);
        });

        Schema::table('pago_planes', function (Blueprint $table) {
            $table->dropColumn(['referenciaPago', 'modalidadPago']);
        });

        Schema::table('categorias', function (Blueprint $table) {
            $table->dropColumn('grupo');
        });
    }
};
