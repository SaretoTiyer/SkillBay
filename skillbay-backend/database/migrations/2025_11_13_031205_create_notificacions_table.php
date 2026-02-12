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
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id('id_Notificacion');
            $table->text('mensaje');
            $table->dateTime('fecha')->useCurrent();
            $table->string('estado', 50)->default('No leído');
            $table->string('tipo', 50)->nullable();
            $table->string('id_CorreoUsuario', 191);
            $table->foreign('id_CorreoUsuario')->references('id_CorreoUsuario')->on('usuarios');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
