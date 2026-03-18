<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            if (!Schema::hasColumn('pago_servicios', 'comprobante')) {
                $table->string('comprobante', 500)->nullable()->after('referenciaPago');
            }
            if (!Schema::hasColumn('pago_servicios', 'fecha_comprobante')) {
                $table->timestamp('fecha_comprobante')->nullable()->after('comprobante');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pago_servicios', function (Blueprint $table) {
            $table->dropColumn(['comprobante', 'fecha_comprobante']);
        });
    }
};
