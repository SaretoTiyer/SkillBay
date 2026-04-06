<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropColumn('fechaReseña');
        });
    }

    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->timestamp('fechaReseña')->nullable()->after('comentario');
        });
    }
};
