<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resenas', function (Blueprint $table) {
            $table->id('id_Reseña');
            $table->integer('calificacion');
            $table->text('comentario')->nullable();
            $table->dateTime('fechaReseña')->useCurrent();
            $table->string('metodoPago', 50)->nullable();
            $table->unsignedBigInteger('id_Servicio');
            $table->foreign('id_Servicio')->references('id_Servicio')->on('servicios');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resenas');
    }
};
