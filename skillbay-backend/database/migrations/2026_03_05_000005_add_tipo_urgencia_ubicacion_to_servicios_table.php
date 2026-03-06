<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            if (!Schema::hasColumn('servicios', 'ubicacion')) {
                $table->string('ubicacion', 191)->nullable()->after('tipo');
            }
            if (!Schema::hasColumn('servicios', 'urgencia')) {
                $table->string('urgencia', 50)->nullable()->after('ubicacion');
            }
        });
    }

    public function down(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->dropColumn(['ubicacion', 'urgencia']);
        });
    }
};
