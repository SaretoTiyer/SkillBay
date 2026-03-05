<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Agrega campo para reseñas bidireccionales:
     * - 'cliente_a_ofertante': Cliente reseña al ofertante
     * - 'ofertante_a_cliente': Ofertante reseña al cliente
     */
    public function up(): void
    {
        // Verificar si la columna 'direccion' ya existe
        $columnExists = DB::select("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'reseñas' 
            AND COLUMN_NAME = 'direccion'");
        
        if (empty($columnExists)) {
            Schema::table('reseñas', function (Blueprint $table) {
                $table->enum('direccion', ['cliente_a_ofertante', 'ofertante_a_cliente'])->nullable()->after('id_CorreoUsuario');
            });
        }
        
        // Verificar si la columna 'id_Postulacion' ya existe
        $postulacionColumnExists = DB::select("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'reseñas' 
            AND COLUMN_NAME = 'id_Postulacion'");
        
        if (empty($postulacionColumnExists)) {
            Schema::table('reseñas', function (Blueprint $table) {
                $table->unsignedBigInteger('id_Postulacion')->nullable()->after('direccion');
                $table->foreign('id_Postulacion')->references('id')->on('postulaciones')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reseñas', function (Blueprint $table) {
            $table->dropForeign(['id_Postulacion']);
            $table->dropColumn(['direccion', 'id_Postulacion']);
        });
    }
};
