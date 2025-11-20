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
        Schema::create('pago_planes', function (Blueprint $table) {
            $table->id('id_PagoPlan');
            $table->decimal('monto', 10, 2);
            $table->dateTime('fechaPago')->useCurrent();
            $table->string('estado', 50)->default('Completado');
            $table->string('metodoPago', 50)->nullable();
            $table->date('fechaInicioPlan')->nullable();
            $table->date('fechaFinPlan')->nullable();
            $table->string('id_CorreoUsuario', 191);
            $table->string('id_Plan', 191);
            $table->foreign('id_CorreoUsuario')->references('id_CorreoUsuario')->on('usuarios');
            $table->foreign('id_Plan')->references('id_Plan')->on('planes');
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pago_plans');
    }
};
