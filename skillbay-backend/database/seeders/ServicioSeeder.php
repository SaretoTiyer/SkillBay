<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class ServicioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * TIPOS DE SERVICIOS:
     * - 'servicio': Un OFERTANTE ofrece un servicio
     *   * id_Cliente = OFERTANTE (quien provee el servicio)
     *   * Los postulantes son CLIENTES potenciales
     *
     * - 'oportunidad': Un CLIENTE busca alguien para un trabajo
     *   * id_Cliente = CLIENTE (quien necesita el servicio)
     *   * Los postulantes son OFERTANTES potenciales
     *
     * ROLES:
     * - OFERTANTE: Quien proporciona el servicio
     *   * En servicio: id_Cliente
     *   * En oportunidad: postulante
     *
     * - CLIENTE: Quien recibe/paga el servicio
     *   * En servicio: postulante
     *   * En oportunidad: id_Cliente
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_CO');

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

        $categorias = Categoria::all();
        if ($categorias->isEmpty()) {
            $this->command->info('No hay categorías. Ejecuta CategoriaSeeder primero.');

            return;
        }

        $ofertantes = Usuario::where('rol', 'ofertante')->get();
        $clientes = Usuario::where('rol', 'cliente')->get();

        if ($ofertantes->isEmpty()) {
            $this->command->info('No hay ofertantes para crear servicios.');

            return;
        }

        /**
         * SERVICIOS (tipo = 'servicio')
         * Creados por OFERTANTES
         * id_Cliente = OFERTANTE
         */
        foreach ($ofertantes->take(5) as $index => $ofertante) {
            $titulosServicios = [
                'Desarrollo de Landing Page',
                'Diseño de Logotipo',
                'Diseño UI/UX para App',
                'Marketing Digital Completo',
                'Soporte Técnico Remoto',
            ];

            Servicio::create([
                'titulo' => $titulosServicios[$index] ?? $faker->sentence(4),
                'descripcion' => $faker->paragraph(3),
                'id_Cliente' => $ofertante->id_CorreoUsuario,
                'estado' => 'Activo',
                'precio' => $faker->numberBetween(100000, 5000000),
                'tiempo_entrega' => $faker->numberBetween(1, 30).' días',
                'id_Categoria' => $categorias->random()->id_Categoria,
                'tipo' => 'servicio',
                'fechaPublicacion' => $faker->dateTimeBetween('-2 months', 'now'),
                'imagen' => $imagenesServicios[$index % count($imagenesServicios)],
                'metodos_pago' => $faker->randomElements($metodosPagoComunes, $faker->numberBetween(2, 4)),
                'modo_trabajo' => $faker->randomElement($modoTrabajo),
            ]);
        }

        /**
         * OPORTUNIDADES (tipo = 'oportunidad')
         * Creadas por CLIENTES
         * id_Cliente = CLIENTE
         */
        if (! $clientes->isEmpty()) {
            foreach ($clientes->take(10) as $index => $cliente) {
                $titulosOportunidades = [
                    'Se necesita Desarrollador Web',
                    'Busco Diseñador Gráfico',
                    'Necesito Marketing Digital',
                    'Busco Tutor de Programación',
                    'Se busca Diseñador UI/UX',
                ];

                Servicio::create([
                    'titulo' => $titulosOportunidades[$index % count($titulosOportunidades)] ?? 'Se busca: '.$faker->jobTitle(),
                    'descripcion' => 'Empresa busca profesional para proyecto importante. '.$faker->paragraph(2),
                    'id_Cliente' => $cliente->id_CorreoUsuario,
                    'estado' => 'Activo',
                    'precio' => $faker->numberBetween(500000, 10000000),
                    'tiempo_entrega' => $faker->randomElement(['Proyecto único', 'Tiempo completo', 'Medio tiempo', 'Por contrato']),
                    'id_Categoria' => $categorias->random()->id_Categoria,
                    'tipo' => 'oportunidad',
                    'fechaPublicacion' => $faker->dateTimeBetween('-2 months', 'now'),
                    'imagen' => $imagenesOportunidades[$index % count($imagenesOportunidades)],
                    'metodos_pago' => $faker->randomElements($metodosPagoComunes, $faker->numberBetween(2, 4)),
                    'modo_trabajo' => $faker->randomElement($modoTrabajo),
                    'ubicacion' => $faker->randomElement($ciudades),
                    'urgencia' => $faker->randomElement($urgencias),
                ]);
            }
        }

        $this->command->info('Servicios y oportunidades creados correctamente.');
    }
}
