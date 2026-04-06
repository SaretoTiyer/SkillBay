<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (! Schema::hasColumn('usuarios', 'nequi_numero')) {
                $table->string('nequi_numero', 20)->nullable()->after('imagen_perfil');
            }
            if (! Schema::hasColumn('usuarios', 'nequi_nombre')) {
                $table->string('nequi_nombre', 100)->nullable()->after('nequi_numero');
            }
            if (! Schema::hasColumn('usuarios', 'nequi_qr')) {
                $table->string('nequi_qr', 500)->nullable()->after('nequi_nombre');
            }
            if (! Schema::hasColumn('usuarios', 'bancolombia_qr')) {
                $table->string('bancolombia_qr', 500)->nullable()->after('nequi_qr');
            }
            if (! Schema::hasColumn('usuarios', 'metodos_pago_activos')) {
                $table->json('metodos_pago_activos')->nullable()->after('bancolombia_qr');
            }
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn([
                'nequi_numero',
                'nequi_nombre',
                'nequi_qr',
                'bancolombia_qr',
                'metodos_pago_activos',
            ]);
        });
    }
};
