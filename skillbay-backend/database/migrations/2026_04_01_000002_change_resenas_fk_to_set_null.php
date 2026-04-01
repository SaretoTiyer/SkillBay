<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropForeign(['id_Servicio']);
        });

        Schema::table('resenas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_Servicio')->nullable()->change();
            $table->foreign('id_Servicio')
                ->references('id_Servicio')
                ->on('servicios')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropForeign(['id_Servicio']);
        });

        Schema::table('resenas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_Servicio')->nullable(false)->change();
            $table->foreign('id_Servicio')
                ->references('id_Servicio')
                ->on('servicios')
                ->onDelete('cascade');
        });
    }
};
