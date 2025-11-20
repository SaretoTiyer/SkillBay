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
        Schema::create('pago_servicios', function (Blueprint $table) {
            $table->id('id_PagoServicio');
            $table->decimal('monto', 10, 2);
            $table->dateTime('fechaPago')->useCurrent();
            $table->string('estado', 50)->default('Completado');
            $table->string('metodoPago', 50)->nullable();
            $table->unsignedBigInteger('id_Servicio');
            $table->foreign('id_Servicio')->references('id_Servicio')->on('servicios');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pago_servicios');
    }
};
