<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
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

    public function down(): void
    {
        Schema::table('pago_planes', function (Blueprint $table) {
            $table->string('mp_preference_id', 120)->nullable();
            $table->string('mp_payment_id', 80)->nullable();
            $table->string('mp_status', 30)->nullable();
            $table->text('mp_init_point')->nullable();
            $table->text('mp_sandbox_init_point')->nullable();
        });
    }
};
