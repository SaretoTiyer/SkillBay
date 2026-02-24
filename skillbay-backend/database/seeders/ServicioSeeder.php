<?php

namespace Database\Seeders;

use App\Models\Servicio;
use Illuminate\Database\Seeder;

class ServicioSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_CO');
        
        // Ensure at least one static client exists (created in UsuarioSeeder)
        $clienteId = 'cliente@skillbay.com';

        // Static services for consistent testing - type: 'servicio'
        Servicio::create([
            'titulo' => 'Desarrollo de Landing Page',
            'descripcion' => 'Diseño y desarrollo de una landing page moderna y responsiva.',
            'id_Cliente' => $clienteId,
            'estado' => 'Activo',
            'precio' => 500000,
            'tiempo_entrega' => '5 días',
            'id_Categoria' => 'web',
            'tipo' => 'servicio',
        ]);

        Servicio::create([
            'titulo' => 'Diseño de Logotipo',
            'descripcion' => 'Creación de identidad visual completa para tu marca.',
            'id_Cliente' => $clienteId,
            'estado' => 'Activo',
            'precio' => 200000,
            'tiempo_entrega' => '3 días',
            'id_Categoria' => 'design',
            'tipo' => 'servicio',
        ]);

        // Generate more random services from random clients
        // We need users with rol 'cliente' to own these services
        $clientes = \App\Models\Usuario::where('rol', 'cliente')->get();
        if ($clientes->isEmpty()) return;

        $categorias = \App\Models\Categoria::all();
        if ($categorias->isEmpty()) return;

        for ($i = 0; $i < 10; $i++) {
            Servicio::create([
                'titulo' => $faker->sentence(4),
                'descripcion' => $faker->paragraph(3),
                'id_Cliente' => $clientes->random()->id_CorreoUsuario,
                'estado' => 'Activo',
                'precio' => $faker->numberBetween(100000, 5000000),
                'tiempo_entrega' => $faker->numberBetween(1, 60) . ' días',
                'id_Categoria' => $categorias->random()->id_Categoria,
                'fechaPublicacion' => $faker->dateTimeBetween('-2 months', 'now'),
                'tipo' => 'servicio',
            ]);
        }

        // Generate oportunidades (job opportunities) - type: 'oportunidad'
        for ($i = 0; $i < 10; $i++) {
            Servicio::create([
                'titulo' => 'Se busca: ' . $faker->jobTitle(),
                'descripcion' => 'Empresa busca profesional para proyecto importante. ' . $faker->paragraph(2),
                'id_Cliente' => $clientes->random()->id_CorreoUsuario,
                'estado' => 'Activo',
                'precio' => $faker->numberBetween(500000, 10000000),
                'tiempo_entrega' => $faker->randomElement(['Proyecto único', 'Tiempo completo', 'Medio tiempo', 'Por contrato']),
                'id_Categoria' => $categorias->random()->id_Categoria,
                'fechaPublicacion' => $faker->dateTimeBetween('-2 months', 'now'),
                'tipo' => 'oportunidad',
            ]);
        }
    }
}
