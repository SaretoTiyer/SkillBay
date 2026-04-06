<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->dropForeign(['id_Servicio']);
        });

        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->foreign('id_Servicio')
                ->references('id_Servicio')
                ->on('servicios')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->dropForeign(['id_Servicio']);
        });

        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->foreign('id_Servicio')
                ->references('id_Servicio')
                ->on('servicios');
        });
    }
};
