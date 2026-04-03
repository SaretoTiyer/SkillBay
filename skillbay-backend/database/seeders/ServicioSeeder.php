<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class ServicioSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_CO');

        $metodosPagoComunes = ['tarjeta', 'nequi', 'bancolombia_qr', 'efectivo'];
        $modoTrabajo = ['virtual', 'presencial', 'mixto'];
        $urgencias = ['baja', 'media', 'alta'];
        $estados = ['Activo', 'Activo', 'Activo', 'Borrador', 'Inactivo'];
        $ciudades = ['Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales'];

        $imagenesServicios = [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
            'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
            'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
            'https://images.unsplash.com/photo-1522542550221-31fd8575f6a5?w=800',
            'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
            'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
        ];

        $imagenesOportunidades = [
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
            'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
            'https://images.unsplash.com/photo-1552581234-26160f608093?w=800',
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
            'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
        ];

        $titulosServicios = [
            'Desarrollo de Landing Page Profesional',
            'Diseño de Logotipo Corporativo',
            'Diseño UI/UX para Aplicación Móvil',
            'Marketing Digital Completo - SEO y Ads',
            'Soporte Técnico Remoto 24/7',
            'Desarrollo de Tienda Virtual WooCommerce',
            'Diseño de Identidad Visual Completa',
            'Desarrollo de API REST y Backend',
            'Creación de Contenido para Redes Sociales',
            'Consultoría en Transformación Digital',
            'Desarrollo de Aplicación React Native',
            'Diseño de Presentaciones Corporativas',
            'Edición de Video Profesional',
            'Desarrollo de Chatbot con IA',
            'Implementación de CRM Empresarial',
        ];

        $titulosOportunidades = [
            'Se necesita Desarrollador Web React',
            'Busco Diseñador Gráfico Freelancer',
            'Necesito Marketing Digital paraStartup',
            'Busco Tutor de Programación Python',
            'Se busca Diseñador UI/UX Senior',
            'Empresa busca Community Manager',
            'Busco Desarrollador Mobile Flutter',
            'Necesito Asesor Legal Empresarial',
            'Se busca Traductor Ingles-Español',
            'Busco Contador Público para Startup',
            'Empresa requiere Desarrollador FullStack',
            'Busco Freelancer para Proyecto SEO',
            'Se necesita Consultor de Datos',
            'Busco Editor de Video para YouTube',
            'Empresa busca Gestor de Proyectos Ágil',
        ];

        $categorias = Categoria::all();
        if ($categorias->isEmpty()) {
            $this->command->info('No hay categorías. Ejecuta CategoriaSeeder primero.');
            return;
        }

        $ofertantes = Usuario::where('rol', 'ofertante')->where('bloqueado', false)->get();
        $clientes = Usuario::where('rol', 'cliente')->where('bloqueado', false)->get();

        if ($ofertantes->isEmpty()) {
            $this->command->info('No hay ofertantes para crear servicios.');
            return;
        }

        // ========== SERVICIOS (tipo = 'servicio') ==========
        $servicioIndex = 0;
        foreach ($ofertantes as $ofertante) {
            foreach (range(1, 2) as $servicioNum) {
                $precioBase = $servicioNum === 1 ? $faker->numberBetween(100000, 1500000) : $faker->numberBetween(50000, 800000);
                
                Servicio::create([
                    'titulo' => $titulosServicios[$servicioIndex % count($titulosServicios)] ?? $faker->sentence(4),
                    'descripcion' => $faker->paragraph(3),
                    'id_Dueno' => $ofertante->id_CorreoUsuario,
                    'estado' => $faker->randomElement($estados),
                    'precio' => $precioBase,
                    'tiempo_entrega' => $faker->numberBetween(1, 30).' días',
                    'id_Categoria' => $categorias->random()->id_Categoria,
                    'tipo' => 'servicio',
                    'fechaPublicacion' => $faker->dateTimeBetween('-3 months', 'now'),
                    'imagen' => $imagenesServicios[$servicioIndex % count($imagenesServicios)],
                    'metodos_pago' => $faker->randomElements($metodosPagoComunes, $faker->numberBetween(2, 4)),
                    'modo_trabajo' => $faker->randomElement($modoTrabajo),
                    'urgencia' => $faker->randomElement($urgencias),
                ]);
                $servicioIndex++;
            }
        }

        // ========== OPORTUNIDADES (tipo = 'oportunidad') ==========
        $oportunidadIndex = 0;
        if (! $clientes->isEmpty()) {
            foreach ($clientes as $cliente) {
                foreach (range(1, 2) as $oportunidadNum) {
                    $presupuestoBase = $oportunidadNum === 1 ? $faker->numberBetween(500000, 8000000) : $faker->numberBetween(200000, 3000000);
                    
                    Servicio::create([
                        'titulo' => $titulosOportunidades[$oportunidadIndex % count($titulosOportunidades)] ?? 'Se busca: '.$faker->jobTitle(),
                        'descripcion' => 'Empresa o particulares buscan profesional para proyecto importante. '.$faker->paragraph(2),
                        'id_Dueno' => $cliente->id_CorreoUsuario,
                        'estado' => $faker->randomElement($estados),
                        'precio' => $presupuestoBase,
                        'tiempo_entrega' => $faker->randomElement(['Proyecto único', 'Tiempo completo', 'Medio tiempo', 'Por contrato', 'Consultoría puntual']),
                        'id_Categoria' => $categorias->random()->id_Categoria,
                        'tipo' => 'oportunidad',
                        'fechaPublicacion' => $faker->dateTimeBetween('-3 months', 'now'),
                        'imagen' => $imagenesOportunidades[$oportunidadIndex % count($imagenesOportunidades)],
                        'metodos_pago' => $faker->randomElements($metodosPagoComunes, $faker->numberBetween(2, 4)),
                        'modo_trabajo' => $faker->randomElement($modoTrabajo),
                        'ubicacion' => $faker->randomElement($ciudades),
                        'urgencia' => $faker->randomElement($urgencias),
                    ]);
                    $oportunidadIndex++;
                }
            }
        }

        $this->command->info('Servicios y oportunidades creados correctamente.');
    }
}