<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Agrega campos de integración con MercadoPago a la tabla pago_planes.
     */
    public function up(): void
    {
        Schema::table('pago_planes', function (Blueprint $table) {
            // ID de la preferencia creada en MP (init_point)
            $table->string('mp_preference_id', 120)->nullable()->after('referenciaPago');
            // ID del pago confirmado por MP (payment_id en webhook)
            $table->string('mp_payment_id', 80)->nullable()->after('mp_preference_id');
            // Estado reportado por MP: approved, pending, rejected, cancelled
            $table->string('mp_status', 30)->nullable()->after('mp_payment_id');
            // URL de checkout pro generada por MP
            $table->text('mp_init_point')->nullable()->after('mp_status');
            // URL de sandbox para pruebas
            $table->text('mp_sandbox_init_point')->nullable()->after('mp_init_point');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pago_planes', function (Blueprint $table) {
            $table->dropColumn([
                'mp_preference_id',
                'mp_payment_id',
                'mp_status',
                'mp_init_point',
                'mp_sandbox_init_point',
            ]);
        });
    }
};
