<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            if (! Schema::hasColumn('resenas', 'id_CorreoUsuario')) {
                $table->string('id_CorreoUsuario', 191)->nullable()->after('id_Servicio');
                $table->foreign('id_CorreoUsuario')
                    ->references('id_CorreoUsuario')
                    ->on('usuarios')
                    ->onDelete('set null');
            }
            if (! Schema::hasColumn('resenas', 'direccion')) {
                $table->enum('direccion', ['cliente_a_ofertante', 'ofertante_a_cliente'])
                    ->nullable()
                    ->after('id_CorreoUsuario');
            }
            if (! Schema::hasColumn('resenas', 'id_Postulacion')) {
                $table->unsignedBigInteger('id_Postulacion')->nullable()->after('direccion');
                $table->foreign('id_Postulacion')
                    ->references('id')
                    ->on('postulaciones')
                    ->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            if (Schema::hasColumn('resenas', 'id_CorreoUsuario')) {
                $table->dropForeign(['id_CorreoUsuario']);
            }
            if (Schema::hasColumn('resenas', 'id_Postulacion')) {
                $table->dropForeign(['id_Postulacion']);
            }
            $table->dropColumn(['id_CorreoUsuario', 'direccion', 'id_Postulacion']);
        });
    }
};
