<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE postulaciones MODIFY estado ENUM('pendiente','aceptada','rechazada','cancelada') NOT NULL DEFAULT 'pendiente'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE postulaciones MODIFY estado ENUM('pendiente','aceptada','rechazada') NOT NULL DEFAULT 'pendiente'");
    }
};
