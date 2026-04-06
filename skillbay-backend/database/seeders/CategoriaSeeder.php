<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            // Tecnologia
            ['id_Categoria' => 'tec_desarrollo_web', 'nombre' => 'Desarrollo Web', 'grupo' => 'Tecnologia', 'descripcion' => 'Programacion y desarrollo de sitios web.', 'imagen' => 'categorias/desarrollo_web.jpg'],
            ['id_Categoria' => 'tec_desarrollo_mobile', 'nombre' => 'Desarrollo Mobile', 'grupo' => 'Tecnologia', 'descripcion' => 'Desarrollo de aplicaciones moviles para iOS y Android.', 'imagen' => 'categorias/desarrollo_mobile.jpg'],
            ['id_Categoria' => 'tec_diseno_ui_ux', 'nombre' => 'Diseno UI/UX', 'grupo' => 'Tecnologia', 'descripcion' => 'Diseno de interfaces y experiencia de usuario.', 'imagen' => 'categorias/diseno_ui_ux.jpg'],
            ['id_Categoria' => 'tec_diseno_grafico', 'nombre' => 'Diseno Grafico', 'grupo' => 'Tecnologia', 'descripcion' => 'Diseno visual, branding y piezas digitales.', 'imagen' => 'categorias/diseno_grafico.jpg'],
            ['id_Categoria' => 'tec_soporte_tecnico', 'nombre' => 'Soporte Tecnico', 'grupo' => 'Tecnologia', 'descripcion' => 'Soporte y mantenimiento tecnologico.', 'imagen' => 'categorias/soporte_tecnico.jpg'],
            ['id_Categoria' => 'tec_marketing_digital', 'nombre' => 'Marketing Digital', 'grupo' => 'Tecnologia', 'descripcion' => 'Campanas digitales y posicionamiento.', 'imagen' => 'categorias/marketing_digital.jpg'],
            ['id_Categoria' => 'tec_redes_seguridad', 'nombre' => 'Redes y Seguridad', 'grupo' => 'Tecnologia', 'descripcion' => 'Configuracion de redes y seguridad informatica.', 'imagen' => 'categorias/redes_y_seguridad.jpg'],
            ['id_Categoria' => 'tec_data_science', 'nombre' => 'Data Science', 'grupo' => 'Tecnologia', 'descripcion' => 'Analisis de datos y machine learning.', 'imagen' => 'categorias/data_science.jpg'],

            // Cuidado del Hogar
            ['id_Categoria' => 'hog_limpieza', 'nombre' => 'Limpieza', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Servicios de limpieza para casa u oficina.', 'imagen' => 'categorias/limpieza.jpg'],
            ['id_Categoria' => 'hog_jardineria', 'nombre' => 'Jardineria', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Mantenimiento y cuidado de jardines.', 'imagen' => 'categorias/jardineria.jpg'],
            ['id_Categoria' => 'hog_plomeria', 'nombre' => 'Plomeria', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Instalacion y reparacion de tuberias.', 'imagen' => 'categorias/plomeria.jpg'],
            ['id_Categoria' => 'hog_electricidad', 'nombre' => 'Electricidad', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Instalaciones y reparaciones electricas.', 'imagen' => 'categorias/electricidad.jpg'],

            // Educacion
            ['id_Categoria' => 'edu_tutorias', 'nombre' => 'Tutorias', 'grupo' => 'Educacion', 'descripcion' => 'Refuerzo academico personalizado.', 'imagen' => 'categorias/tutorias.jpg'],
            ['id_Categoria' => 'edu_idiomas', 'nombre' => 'Idiomas', 'grupo' => 'Educacion', 'descripcion' => 'Clases y practica de idiomas.', 'imagen' => 'categorias/idiomas.jpg'],
            ['id_Categoria' => 'edu_musica', 'nombre' => 'Musica', 'grupo' => 'Educacion', 'descripcion' => 'Clases de instrumentos y teoria musical.', 'imagen' => 'categorias/musica.jpg'],
            ['id_Categoria' => 'edu_preparacion_examenes', 'nombre' => 'Preparacion Examenes', 'grupo' => 'Educacion', 'descripcion' => 'Acompanamiento para pruebas y examenes.', 'imagen' => 'categorias/preparacion_examenes.jpg'],

            // Servicios Generales
            ['id_Categoria' => 'sg_consultoria', 'nombre' => 'Consultoria', 'grupo' => 'Servicios Generales', 'descripcion' => 'Asesoria profesional especializada.', 'imagen' => 'categorias/consultoria.jpg'],
            ['id_Categoria' => 'sg_asesoria_legal', 'nombre' => 'Asesoria Legal', 'grupo' => 'Servicios Generales', 'descripcion' => 'Orientacion legal y juridica.', 'imagen' => 'categorias/asesoria_legal.jpg'],
            ['id_Categoria' => 'sg_contabilidad', 'nombre' => 'Contabilidad', 'grupo' => 'Servicios Generales', 'descripcion' => 'Gestion contable y financiera.', 'imagen' => 'categorias/contabilidad.jpg'],
            ['id_Categoria' => 'sg_recursos_humanos', 'nombre' => 'Recursos Humanos', 'grupo' => 'Servicios Generales', 'descripcion' => 'Gestion de talento y nomina.', 'imagen' => 'categorias/recursos_humanos.jpg'],
            ['id_Categoria' => 'sg_traduccion', 'nombre' => 'Traduccion', 'grupo' => 'Servicios Generales', 'descripcion' => 'Traducciones profesionales.', 'imagen' => 'categorias/traduccion.jpg'],
            ['id_Categoria' => 'sg_ingenieria', 'nombre' => 'Ingenieria', 'grupo' => 'Servicios Generales', 'descripcion' => 'Servicios de ingenieria y proyectos.', 'imagen' => 'categorias/ingenieria.jpg'],

            // Eventos
            ['id_Categoria' => 'eve_organizacion', 'nombre' => 'Organizacion', 'grupo' => 'Eventos', 'descripcion' => 'Planeacion y logistica de eventos.', 'imagen' => 'categorias/organizacion.jpg'],
            ['id_Categoria' => 'eve_catering', 'nombre' => 'Catering', 'grupo' => 'Eventos', 'descripcion' => 'Alimentos y bebidas para eventos.', 'imagen' => 'categorias/catering.jpg'],
            ['id_Categoria' => 'eve_fotografia', 'nombre' => 'Fotografia', 'grupo' => 'Eventos', 'descripcion' => 'Cobertura fotografica profesional.', 'imagen' => 'categorias/fotografia.jpg'],
            ['id_Categoria' => 'eve_decoracion', 'nombre' => 'Decoracion', 'grupo' => 'Eventos', 'descripcion' => 'Ambientacion y decoracion tematica.', 'imagen' => 'categorias/decoracion.jpg'],

            // Oficios Manuales
            ['id_Categoria' => 'ofi_carpinteria', 'nombre' => 'Carpinteria', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Trabajos en madera y muebles.', 'imagen' => 'categorias/carpinteria.jpg'],
            ['id_Categoria' => 'ofi_pintura', 'nombre' => 'Pintura', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Pintura de espacios y acabados.', 'imagen' => 'categorias/pintura.jpg'],
            ['id_Categoria' => 'ofi_albanileria', 'nombre' => 'Albanileria', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Construccion y adecuaciones civiles.', 'imagen' => 'categorias/albanileria.jpg'],
            ['id_Categoria' => 'ofi_reparaciones', 'nombre' => 'Reparaciones', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Arreglos generales y mantenimiento.', 'imagen' => 'categorias/reparaciones.jpg'],
        ];

        foreach ($categorias as $categoria) {
            Categoria::updateOrCreate(
                ['id_Categoria' => $categoria['id_Categoria']],
                $categoria
            );
        }
    }
}
