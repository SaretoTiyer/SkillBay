<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            // Tecnología
            ['id_Categoria' => 'tec_desarrollo_web', 'nombre' => 'Desarrollo Web', 'grupo' => 'Tecnologia', 'descripcion' => 'Programacion y desarrollo de sitios web.', 'imagen' => 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80'],
            ['id_Categoria' => 'tec_diseno_grafico', 'nombre' => 'Diseno Grafico', 'grupo' => 'Tecnologia', 'descripcion' => 'Diseno visual, branding y piezas digitales.', 'imagen' => 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80'],
            ['id_Categoria' => 'tec_soporte_tecnico', 'nombre' => 'Soporte Tecnico', 'grupo' => 'Tecnologia', 'descripcion' => 'Soporte y mantenimiento tecnologico.', 'imagen' => 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80'],
            ['id_Categoria' => 'tec_marketing_digital', 'nombre' => 'Marketing Digital', 'grupo' => 'Tecnologia', 'descripcion' => 'Campanas digitales y posicionamiento.', 'imagen' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'],

            // Cuidado del Hogar
            ['id_Categoria' => 'hog_limpieza', 'nombre' => 'Limpieza', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Servicios de limpieza para casa u oficina.', 'imagen' => 'https://images.unsplash.com/photo-1581578731548-c64695ccb2b3?w=800&q=80'],
            ['id_Categoria' => 'hog_jardineria', 'nombre' => 'Jardineria', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Mantenimiento y cuidado de jardines.', 'imagen' => 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80'],
            ['id_Categoria' => 'hog_plomeria', 'nombre' => 'Plomeria', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Instalacion y reparacion de tuberias.', 'imagen' => 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80'],
            ['id_Categoria' => 'hog_electricidad', 'nombre' => 'Electricidad', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Instalaciones y reparaciones electricas.', 'imagen' => 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80'],

            // Educación
            ['id_Categoria' => 'edu_tutorias', 'nombre' => 'Tutorias', 'grupo' => 'Educacion', 'descripcion' => 'Refuerzo academico personalizado.', 'imagen' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'],
            ['id_Categoria' => 'edu_idiomas', 'nombre' => 'Idiomas', 'grupo' => 'Educacion', 'descripcion' => 'Clases y practica de idiomas.', 'imagen' => 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80'],
            ['id_Categoria' => 'edu_musica', 'nombre' => 'Musica', 'grupo' => 'Educacion', 'descripcion' => 'Clases de instrumentos y teoria musical.', 'imagen' => 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80'],
            ['id_Categoria' => 'edu_preparacion_examenes', 'nombre' => 'Preparacion Examenes', 'grupo' => 'Educacion', 'descripcion' => 'Acompanamiento para pruebas y examenes.', 'imagen' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80'],

            // Servicios Generales
            ['id_Categoria' => 'sg_consultoria', 'nombre' => 'Consultoria', 'grupo' => 'Servicios Generales', 'descripcion' => 'Asesoria profesional especializada.', 'imagen' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80'],
            ['id_Categoria' => 'sg_asesoria_legal', 'nombre' => 'Asesoria Legal', 'grupo' => 'Servicios Generales', 'descripcion' => 'Orientacion legal y juridica.', 'imagen' => 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80'],
            ['id_Categoria' => 'sg_contabilidad', 'nombre' => 'Contabilidad', 'grupo' => 'Servicios Generales', 'descripcion' => 'Gestion contable y financiera.', 'imagen' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80'],
            ['id_Categoria' => 'sg_traduccion', 'nombre' => 'Traduccion', 'grupo' => 'Servicios Generales', 'descripcion' => 'Traducciones profesionales.', 'imagen' => 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80'],

            // Eventos
            ['id_Categoria' => 'eve_organizacion', 'nombre' => 'Organizacion', 'grupo' => 'Eventos', 'descripcion' => 'Planeacion y logistica de eventos.', 'imagen' => 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'],
            ['id_Categoria' => 'eve_catering', 'nombre' => 'Catering', 'grupo' => 'Eventos', 'descripcion' => 'Alimentos y bebidas para eventos.', 'imagen' => 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80'],
            ['id_Categoria' => 'eve_fotografia', 'nombre' => 'Fotografia', 'grupo' => 'Eventos', 'descripcion' => 'Cobertura fotografica profesional.', 'imagen' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'],
            ['id_Categoria' => 'eve_decoracion', 'nombre' => 'Decoracion', 'grupo' => 'Eventos', 'descripcion' => 'Ambientacion y decoracion tematica.', 'imagen' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],

            // Oficios Manuales
            ['id_Categoria' => 'ofi_carpinteria', 'nombre' => 'Carpinteria', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Trabajos en madera y muebles.', 'imagen' => 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&q=80'],
            ['id_Categoria' => 'ofi_pintura', 'nombre' => 'Pintura', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Pintura de espacios y acabados.', 'imagen' => 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80'],
            ['id_Categoria' => 'ofi_albanileria', 'nombre' => 'Albanileria', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Construccion y adecuaciones civiles.', 'imagen' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'],
            ['id_Categoria' => 'ofi_reparaciones', 'nombre' => 'Reparaciones', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Arreglos generales y mantenimiento.', 'imagen' => 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80'],
        ];

        foreach ($categorias as $categoria) {
            Categoria::updateOrCreate(
                ['id_Categoria' => $categoria['id_Categoria']],
                $categoria
            );
        }
    }
}
