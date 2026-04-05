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

        // Servicios con categoria EXPLÍCITA para que la imagen coincida
        // Cada servicio tiene: titulo, categoria_id, y descripcion coherente
        $serviciosData = [
            [
                'titulo' => 'Desarrollo de Landing Page Profesional',
                'cat' => 'tec_desarrollo_web',
                'desc' => 'Creo landing pages modernas, responsivas y optimizadas para conversion. Incluye diseno personalizado, integracion con formularios y analitica.',
                'tipo' => 'servicio',
            ],
            [
                'titulo' => 'Desarrollo de Tienda Virtual WooCommerce',
                'cat' => 'tec_desarrollo_web',
                'desc' => 'Tienda online completa con WooCommerce, pasarela de pagos, gestion de inventario y diseno profesional.',
                'tipo' => 'servicio',
            ],
            [
                'titulo' => 'Diseno de Logotipo Corporativo',
                'cat' => 'tec_diseno_grafico',
                'desc' => 'Creacion de logotipos profesionales con manual de marca, paleta de colores y aplicaciones en diferentes formatos.',
                'tipo' => 'servicio',
            ],
            [
                'titulo' => 'Diseno de Identidad Visual Completa',
                'cat' => 'tec_diseno_grafico',
                'desc' => 'Paquete completo de branding: logotipo, papeleria, redes sociales y guia de estilo para tu marca.',
                'tipo' => 'servicio',
            ],
            [
                'titulo' => 'Diseno UI/UX para Aplicacion Movil',
                'cat' => 'tec_diseno_ui_ux',
                'desc' => 'Diseno de interfaces intuitivas y atractivas para apps moviles. Wireframes, prototipos interactivos y diseno final en Figma.',
                'tipo' => 'servicio',
            ],
            [
                'titulo' => 'Desarrollo de Aplicacion React Native',
                'cat' => 'tec_desarrollo_mobile',
                'desc' => 'Desarrollo de aplicaciones moviles multiplataforma con React Native para iOS y Android con una sola base de codigo.',
                'tipo' => 'servicio',
            ],
            [
                'titulo' => 'Marketing Digital Completo - SEO y Ads',
                'cat' => 'tec_marketing_digital',
                'desc' => 'Estrategia integral de marketing digital: SEO, Google Ads, Meta Ads, email marketing y analitica web.',
                'tipo' => 'servicio',
            ],
            [
                'titulo' => 'Soporte Tecnico Remoto 24/7',
                'cat' => 'tec_soporte_tecnico',
                'desc' => 'Soporte tecnico remoto para empresas y particulares. Resolucion de problemas de hardware, software y redes.',
                'tipo' => 'servicio',
            ],
            [
                'titulo' => 'Consultoria en Transformacion Digital',
                'cat' => 'sg_consultoria',
                'desc' => 'Asesoria especializada para digitalizar procesos empresariales, automatizar tareas y mejorar la productividad.',
                'tipo' => 'servicio',
            ],
            [
                'titulo' => 'Clases de Guitarra para Principiantes',
                'cat' => 'edu_musica',
                'desc' => 'Clases personalizadas de guitarra acustica y electrica. Desde nivel basico hasta intermedio, teoria musical incluida.',
                'tipo' => 'servicio',
            ],
        ];

        // Oportunidades con categoria EXPLICITA
        $oportunidadesData = [
            [
                'titulo' => 'Se necesita Desarrollador Web React',
                'cat' => 'tec_desarrollo_web',
                'desc' => 'Empresa de tecnologia busca desarrollador React con experiencia en Next.js para proyecto de 3 meses.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Busco Disenador Grafico Freelancer',
                'cat' => 'tec_diseno_grafico',
                'desc' => 'Startup busca disenador grafico para crear material publicitario y contenido para redes sociales.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Necesito Marketing Digital para Startup',
                'cat' => 'tec_marketing_digital',
                'desc' => 'Startup fintech necesita experto en marketing digital para lanzamiento de producto y crecimiento de usuarios.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Busco Tutor de Programacion Python',
                'cat' => 'edu_tutorias',
                'desc' => 'Estudiante universitario busca tutor de Python para preparacion de examen de programacion avanzada.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Se busca Disenador UI/UX Senior',
                'cat' => 'tec_diseno_ui_ux',
                'desc' => 'Agencia digital busca disenador UI/UX senior con portafolio comprobable en proyectos SaaS.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Empresa busca Community Manager',
                'cat' => 'tec_marketing_digital',
                'desc' => 'Restaurante cadena busca community manager para gestion de redes sociales y creacion de contenido.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Busco Desarrollador Mobile Flutter',
                'cat' => 'tec_desarrollo_mobile',
                'desc' => 'Empresa de logistica necesita app movil en Flutter para gestion de entregas en tiempo real.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Necesito Asesor Legal Empresarial',
                'cat' => 'sg_asesoria_legal',
                'desc' => 'PYME necesita asesoria legal para constitucion de sociedad, contratos laborales y propiedad intelectual.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Se busca Traductor Ingles-Espanol',
                'cat' => 'sg_traduccion',
                'desc' => 'Editorial busca traductor profesional para traduccion de 3 libros de negocios del ingles al espanol.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Busco Contador Publico para Startup',
                'cat' => 'sg_contabilidad',
                'desc' => 'Startup tecnologica necesita contador publico para gestion tributaria, nomina y estados financieros.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Empresa requiere Organizador de Eventos',
                'cat' => 'eve_organizacion',
                'desc' => 'Corporacion necesita organizador de eventos para conferencia anual de 500 personas en Cartagena.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Busco Fotografo para Evento Corporativo',
                'cat' => 'eve_fotografia',
                'desc' => 'Empresa necesita fotografo profesional para cubrir evento de lanzamiento de producto con 200 invitados.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Se necesita Carpintero para Muebles a Medida',
                'cat' => 'ofi_carpinteria',
                'desc' => 'Familia busca carpintero experimentado para fabricar cocina integral y closets a medida.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Busco Pintor para Casa Completa',
                'cat' => 'ofi_pintura',
                'desc' => 'Propietario busca pintor profesional para pintar casa de 3 pisos, interiores y exteriores.',
                'tipo' => 'oportunidad',
            ],
            [
                'titulo' => 'Necesito Servicio de Limpieza Profunda',
                'cat' => 'hog_limpieza',
                'desc' => 'Oficina de 200m2 necesita servicio de limpieza profunda despues de remodelacion.',
                'tipo' => 'oportunidad',
            ],
        ];

        $categorias = Categoria::all()->keyBy('id_Categoria');
        if ($categorias->isEmpty()) {
            $this->command->info('No hay categorias. Ejecuta CategoriaSeeder primero.');
            return;
        }

        $ofertantes = Usuario::where('rol', 'ofertante')->where('bloqueado', false)->get();
        $clientes = Usuario::where('rol', 'cliente')->where('bloqueado', false)->get();

        if ($ofertantes->isEmpty()) {
            $this->command->info('No hay ofertantes para crear servicios.');
            return;
        }

        // ========== SERVICIOS ==========
        foreach ($serviciosData as $index => $data) {
            $ofertante = $ofertantes[$index % $ofertantes->count()];
            $categoria = $categorias[$data['cat']] ?? null;
            if (!$categoria) continue;

            $precio = $faker->numberBetween(100000, 1500000);

            Servicio::create([
                'titulo' => $data['titulo'],
                'descripcion' => $data['desc'],
                'id_Dueno' => $ofertante->id_CorreoUsuario,
                'estado' => $index < 7 ? 'Activo' : $faker->randomElement($estados),
                'precio' => $precio,
                'tiempo_entrega' => $faker->numberBetween(1, 30).' dias',
                'id_Categoria' => $categoria->id_Categoria,
                'tipo' => 'servicio',
                'fechaPublicacion' => $faker->dateTimeBetween('-3 months', 'now'),
                'imagen' => null, // Usa la imagen de la categoria
                'metodos_pago' => $faker->randomElements($metodosPagoComunes, $faker->numberBetween(2, 4)),
                'modo_trabajo' => $faker->randomElement($modoTrabajo),
                'urgencia' => $faker->randomElement($urgencias),
            ]);
        }

        // ========== OPORTUNIDADES ==========
        if (! $clientes->isEmpty()) {
            foreach ($oportunidadesData as $index => $data) {
                $cliente = $clientes[$index % $clientes->count()];
                $categoria = $categorias[$data['cat']] ?? null;
                if (!$categoria) continue;

                $presupuesto = $faker->numberBetween(500000, 8000000);

                Servicio::create([
                    'titulo' => $data['titulo'],
                    'descripcion' => $data['desc'],
                    'id_Dueno' => $cliente->id_CorreoUsuario,
                    'estado' => $index < 10 ? 'Activo' : $faker->randomElement($estados),
                    'precio' => $presupuesto,
                    'tiempo_entrega' => $faker->randomElement(['Proyecto unico', 'Tiempo completo', 'Medio tiempo', 'Por contrato', 'Consultoria puntual']),
                    'id_Categoria' => $categoria->id_Categoria,
                    'tipo' => 'oportunidad',
                    'fechaPublicacion' => $faker->dateTimeBetween('-3 months', 'now'),
                    'imagen' => null, // Usa la imagen de la categoria
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
