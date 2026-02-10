<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['id_Categoria' => 'web', 'nombre' => 'Desarrollo Web', 'descripcion' => 'Sitios y aplicaciones web'],
            ['id_Categoria' => 'design', 'nombre' => 'Diseño', 'descripcion' => 'Diseño gráfico y UI/UX'],
            ['id_Categoria' => 'consulting', 'nombre' => 'Consultoría', 'descripcion' => 'Asesoría experta'],
            ['id_Categoria' => 'mobile', 'nombre' => 'Desarrollo Móvil', 'descripcion' => 'Apps para iOS y Android'],
            ['id_Categoria' => 'marketing', 'nombre' => 'Marketing', 'descripcion' => 'Marketing digital y SEO'],
        ];

        foreach ($categorias as $categoria) {
            Categoria::firstOrCreate(
                ['id_Categoria' => $categoria['id_Categoria']],
                $categoria
            );
        }
    }
}
