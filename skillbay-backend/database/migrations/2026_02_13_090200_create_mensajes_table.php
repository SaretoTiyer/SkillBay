<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id('id_Mensaje');
            $table->unsignedBigInteger('id_Postulacion');
            $table->string('id_Emisor', 191);
            $table->text('mensaje');
            $table->dateTime('expiraEn')->nullable();
            $table->timestamps();

            $table->foreign('id_Postulacion')->references('id')->on('postulaciones')->onDelete('cascade');
            $table->foreign('id_Emisor')->references('id_CorreoUsuario')->on('usuarios')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mensajes');
    }
};
