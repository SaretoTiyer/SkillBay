<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pago_planes', function (Blueprint $table) {
            $columns = [
                'mp_preference_id',
                'mp_payment_id',
                'mp_status',
                'mp_init_point',
                'mp_sandbox_init_point',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('pago_planes', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('pago_planes', function (Blueprint $table) {
            if (!Schema::hasColumn('pago_planes', 'mp_preference_id')) {
                $table->string('mp_preference_id', 120)->nullable();
            }
            if (!Schema::hasColumn('pago_planes', 'mp_payment_id')) {
                $table->string('mp_payment_id', 80)->nullable();
            }
            if (!Schema::hasColumn('pago_planes', 'mp_status')) {
                $table->string('mp_status', 30)->nullable();
            }
            if (!Schema::hasColumn('pago_planes', 'mp_init_point')) {
                $table->text('mp_init_point')->nullable();
            }
            if (!Schema::hasColumn('pago_planes', 'mp_sandbox_init_point')) {
                $table->text('mp_sandbox_init_point')->nullable();
            }
        });
    }
};
