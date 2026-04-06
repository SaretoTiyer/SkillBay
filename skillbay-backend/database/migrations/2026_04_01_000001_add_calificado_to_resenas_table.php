<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->string('id_CorreoUsuario_Calificado', 255)
                ->nullable()
                ->after('id_CorreoUsuario')
                ->comment('Usuario que RECIBE la calificación (calificado)');
        });
    }

    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropColumn('id_CorreoUsuario_Calificado');
        });
    }
};
