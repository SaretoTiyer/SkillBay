<?php

namespace Database\Seeders;

use App\Models\Servicio;
use Illuminate\Database\Seeder;

class ServicioSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_CO');

        $clienteId = 'cliente@skillbay.com';

        $metodosPagoComunes = ['tarjeta', 'nequi', 'bancolombia_qr', 'efectivo'];
        $modoTrabajo = ['virtual', 'presencial', 'mixto'];
        $urgencias = ['baja', 'media', 'alta'];
        $ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'];

        $imagenesServicios = [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
            'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
            'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        ];

        $imagenesOportunidades = [
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
            'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
            'https://images.unsplash.com/photo-1552581234-26160f608093?w=800',
        ];

        Servicio::create([
            'titulo' => 'Desarrollo de Landing Page',
            'descripcion' => 'Diseño y desarrollo de una landing page moderna y responsiva. Incluye diseño personalizado, optimización SEO básica, formularios de contacto y compatibilidad con dispositivos móviles.',
            'id_Cliente' => $clienteId,
            'estado' => 'Activo',
            'precio' => 500000,
            'tiempo_entrega' => '5 días',
            'id_Categoria' => 'tec_desarrollo_web',
            'tipo' => 'servicio',
            'fechaPublicacion' => now()->subDays(15),
            'imagen' => $imagenesServicios[0],
            'metodos_pago' => ['tarjeta', 'nequi', 'bancolombia_qr'],
            'modo_trabajo' => 'virtual',
        ]);

        Servicio::create([
            'titulo' => 'Diseño de Logotipo',
            'descripcion' => 'Creación de identidad visual completa para tu marca. Incluye logotipo en múltiples formatos, paleta de colores y guía de uso básico.',
            'id_Cliente' => $clienteId,
            'estado' => 'Activo',
            'precio' => 200000,
            'tiempo_entrega' => '3 días',
            'id_Categoria' => 'tec_diseno_grafico',
            'tipo' => 'servicio',
            'fechaPublicacion' => now()->subDays(10),
            'imagen' => $imagenesServicios[1],
            'metodos_pago' => ['tarjeta', 'efectivo'],
            'modo_trabajo' => 'virtual',
        ]);

        $clientes = \App\Models\Usuario::where('rol', 'cliente')->get();
        if ($clientes->isEmpty()) {
            return;
        }

        $categorias = \App\Models\Categoria::all();
        if ($categorias->isEmpty()) {
            return;
        }

        for ($i = 0; $i < 10; $i++) {
            Servicio::create([
                'titulo' => $faker->sentence(4),
                'descripcion' => $faker->paragraph(3),
                'id_Cliente' => $clientes->random()->id_CorreoUsuario,
                'estado' => 'Activo',
                'precio' => $faker->numberBetween(100000, 5000000),
                'tiempo_entrega' => $faker->numberBetween(1, 60).' días',
                'id_Categoria' => $categorias->random()->id_Categoria,
                'fechaPublicacion' => $faker->dateTimeBetween('-2 months', 'now'),
                'tipo' => 'servicio',
                'imagen' => $faker->randomElement($imagenesServicios),
                'metodos_pago' => $faker->randomElements($metodosPagoComunes, $faker->numberBetween(2, 4)),
                'modo_trabajo' => $faker->randomElement($modoTrabajo),
            ]);
        }

        for ($i = 0; $i < 10; $i++) {
            Servicio::create([
                'titulo' => 'Se busca: '.$faker->jobTitle(),
                'descripcion' => 'Empresa busca profesional para proyecto importante. '.$faker->paragraph(2),
                'id_Cliente' => $clientes->random()->id_CorreoUsuario,
                'estado' => 'Activo',
                'precio' => $faker->numberBetween(500000, 10000000),
                'tiempo_entrega' => $faker->randomElement(['Proyecto único', 'Tiempo completo', 'Medio tiempo', 'Por contrato']),
                'id_Categoria' => $categorias->random()->id_Categoria,
                'fechaPublicacion' => $faker->dateTimeBetween('-2 months', 'now'),
                'tipo' => 'oportunidad',
                'imagen' => $faker->randomElement($imagenesOportunidades),
                'metodos_pago' => $faker->randomElements($metodosPagoComunes, $faker->numberBetween(2, 4)),
                'modo_trabajo' => $faker->randomElement($modoTrabajo),
                'ubicacion' => $faker->randomElement($ciudades),
                'urgencia' => $faker->randomElement($urgencias),
            ]);
        }
    }
}
