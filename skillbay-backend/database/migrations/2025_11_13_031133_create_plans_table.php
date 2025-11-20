<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
        public function up(): void
    {
        Schema::create('planes', function (Blueprint $table) {
            $table->string('id_Plan', 191)->primary();
            $table->string('nombre', 100);
            $table->text('beneficios')->nullable();
            $table->decimal('precioMensual', 10, 2);
            $table->integer('limiteServiciosMes')->nullable();
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('planes');
    }
};
