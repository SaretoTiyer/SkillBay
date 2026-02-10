<?php

namespace Database\Seeders;

use App\Models\Servicio;
use Illuminate\Database\Seeder;

class ServicioSeeder extends Seeder
{
    public function run(): void
    {
        // Servicios para el Usuario 'ofertante@skillbay.com'
        // Asegúrate de que este usuario exista (debería por UsuarioSeeder)
        $clienteId = 'ofertante@skillbay.com';

        Servicio::create([
            'titulo' => 'Desarrollo de Landing Page',
            'descripcion' => 'Diseño y desarrollo de una landing page moderna y responsiva.',
            'id_Cliente' => $clienteId,
            'estado' => 'Activo',
            'precio' => 500000,
            'tiempo_entrega' => '5 días',
            'id_Categoria' => 'web',
            // 'imagen' => 'ruta/a/imagen.jpg' // Opcional, dejar null por ahora
        ]);

        Servicio::create([
            'titulo' => 'Diseño de Logotipo',
            'descripcion' => 'Creación de identidad visual completa para tu marca.',
            'id_Cliente' => $clienteId,
            'estado' => 'Activo',
            'precio' => 200000,
            'tiempo_entrega' => '3 días',
            'id_Categoria' => 'design',
        ]);
    }
}
