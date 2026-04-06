<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Añade cascade delete a la foreign key de resenas hacia servicios
     */
    public function up(): void
    {
        // Primero, eliminamos la foreign key existente
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropForeign(['id_Servicio']);
        });

        // Luego, recreamos la foreign key con cascade delete
        Schema::table('resenas', function (Blueprint $table) {
            $table->foreign('id_Servicio')
                ->references('id_Servicio')
                ->on('servicios')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropForeign(['id_Servicio']);
        });

        Schema::table('resenas', function (Blueprint $table) {
            $table->foreign('id_Servicio')
                ->references('id_Servicio')
                ->on('servicios');
        });
    }
};
