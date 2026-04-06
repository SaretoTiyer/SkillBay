<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicios', function (Blueprint $table) {
            $table->id('id_Servicio');
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->string('id_Cliente', 191);
            $table->string('estado', 50)->default('Activo');
            $table->decimal('precio', 10, 2)->nullable();
            $table->string('imagen')->nullable();
            $table->string('tiempo_entrega')->nullable();
            $table->dateTime('fechaPublicacion')->useCurrent();
            $table->string('id_Contratista', 191)->nullable();
            $table->string('id_Categoria', 191)->nullable();

            $table->foreign('id_Cliente')->references('id_CorreoUsuario')->on('usuarios');
            $table->foreign('id_Contratista')->references('id_CorreoUsuario')->on('usuarios');
            $table->foreign('id_Categoria')->references('id_Categoria')->on('categorias');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};
