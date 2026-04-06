<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->enum('rol_calificado', ['ofertante', 'cliente'])
                ->nullable()
                ->index()
                ->after('id_CorreoUsuario_Calificado')
                ->comment('Rol del usuario calificado en esta interacción: ofertante (prestó servicio) o cliente (recibió servicio)');
        });
    }

    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropColumn('rol_calificado');
        });
    }
};
