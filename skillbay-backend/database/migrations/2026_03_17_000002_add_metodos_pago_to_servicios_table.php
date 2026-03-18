<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            if (!Schema::hasColumn('servicios', 'metodos_pago')) {
                $table->json('metodos_pago')->nullable()->after('estado');
            }
            if (!Schema::hasColumn('servicios', 'modo_trabajo')) {
                $table->enum('modo_trabajo', ['virtual', 'presencial', 'mixto'])->nullable()->after('metodos_pago');
            }
        });
    }

    public function down(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->dropColumn([
                'metodos_pago',
                'modo_trabajo',
            ]);
        });
    }
};
