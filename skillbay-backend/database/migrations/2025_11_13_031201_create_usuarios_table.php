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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->string('id_CorreoUsuario', 191)->primary();
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('genero', 50)->nullable();
            $table->string('telefono', 20)->unique();
            $table->string('ciudad', 100)->nullable();
            $table->string('departamento', 100)->nullable();
            $table->string('password');
            $table->string('rol', 50)->default('usuario');
            $table->date('fechaRegistro')->useCurrent();
            $table->string('id_Plan', 191)->nullable();
            $table->foreign('id_Plan')->references('id_Plan')->on('planes')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
