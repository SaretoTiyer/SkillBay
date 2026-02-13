<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes', function (Blueprint $table) {
            $table->id('id_Reporte');
            $table->string('id_Reportador', 191);
            $table->string('id_Reportado', 191);
            $table->unsignedBigInteger('id_Servicio')->nullable();
            $table->unsignedBigInteger('id_Postulacion')->nullable();
            $table->text('motivo');
            $table->string('estado', 50)->default('pendiente');
            $table->timestamps();

            $table->foreign('id_Reportador')->references('id_CorreoUsuario')->on('usuarios')->onDelete('cascade');
            $table->foreign('id_Reportado')->references('id_CorreoUsuario')->on('usuarios')->onDelete('cascade');
            $table->foreign('id_Servicio')->references('id_Servicio')->on('servicios')->onDelete('set null');
            $table->foreign('id_Postulacion')->references('id')->on('postulaciones')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
