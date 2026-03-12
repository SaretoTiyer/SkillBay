<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Añade el campo imagen_perfil a la tabla usuarios
     */
    public function up(): void
    {
        if (! Schema::hasColumn('usuarios', 'imagen_perfil')) {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->string('imagen_perfil', 500)->nullable()->after('departamento');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn('imagen_perfil');
        });
    }
};
