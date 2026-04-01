<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            if (Schema::hasColumn('resenas', 'calificacion')) {
                $table->renameColumn('calificacion', 'calificacion_usuario');
            }

            if (! Schema::hasColumn('resenas', 'calificacion_servicio')) {
                $table->integer('calificacion_servicio')->nullable()->after('calificacion_usuario');
            }

            if (Schema::hasColumn('resenas', 'direccion')) {
                $table->dropColumn('direccion');
            }
        });
    }

    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            if (Schema::hasColumn('resenas', 'calificacion_servicio')) {
                $table->dropColumn('calificacion_servicio');
            }

            if (Schema::hasColumn('resenas', 'calificacion_usuario')) {
                $table->renameColumn('calificacion_usuario', 'calificacion');
            }

            if (! Schema::hasColumn('resenas', 'direccion')) {
                $table->enum('direccion', ['cliente_a_ofertante', 'ofertante_a_cliente'])->nullable()->after('id_CorreoUsuario');
            }
        });
    }
};
