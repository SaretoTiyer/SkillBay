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
        Schema::create('postulaciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_Servicio');
            $table->string('id_Usuario', 191);
            $table->text('mensaje');
            $table->decimal('presupuesto', 10, 2)->nullable();
            $table->string('tiempo_estimado')->nullable();
            $table->enum('estado', ['pendiente', 'aceptada', 'rechazada'])->default('pendiente');
            
            $table->foreign('id_Servicio')->references('id_Servicio')->on('servicios')->onDelete('cascade');
            $table->foreign('id_Usuario')->references('id_CorreoUsuario')->on('usuarios')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('postulaciones');
    }
};
