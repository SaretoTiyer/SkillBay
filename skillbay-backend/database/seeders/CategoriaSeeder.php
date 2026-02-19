<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['id_Categoria' => 'tec_desarrollo_web', 'nombre' => 'Desarrollo Web', 'grupo' => 'Tecnologia', 'descripcion' => 'Programacion y desarrollo de sitios web.'],
            ['id_Categoria' => 'tec_diseno_grafico', 'nombre' => 'Diseno Grafico', 'grupo' => 'Tecnologia', 'descripcion' => 'Diseno visual, branding y piezas digitales.'],
            ['id_Categoria' => 'tec_soporte_tecnico', 'nombre' => 'Soporte Tecnico', 'grupo' => 'Tecnologia', 'descripcion' => 'Soporte y mantenimiento tecnologico.'],
            ['id_Categoria' => 'tec_marketing_digital', 'nombre' => 'Marketing Digital', 'grupo' => 'Tecnologia', 'descripcion' => 'Campanas digitales y posicionamiento.'],

            ['id_Categoria' => 'hog_limpieza', 'nombre' => 'Limpieza', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Servicios de limpieza para casa u oficina.'],
            ['id_Categoria' => 'hog_jardineria', 'nombre' => 'Jardineria', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Mantenimiento y cuidado de jardines.'],
            ['id_Categoria' => 'hog_plomeria', 'nombre' => 'Plomeria', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Instalacion y reparacion de tuberias.'],
            ['id_Categoria' => 'hog_electricidad', 'nombre' => 'Electricidad', 'grupo' => 'Cuidado del Hogar', 'descripcion' => 'Instalaciones y reparaciones electricas.'],

            ['id_Categoria' => 'edu_tutorias', 'nombre' => 'Tutorias', 'grupo' => 'Educacion', 'descripcion' => 'Refuerzo academico personalizado.'],
            ['id_Categoria' => 'edu_idiomas', 'nombre' => 'Idiomas', 'grupo' => 'Educacion', 'descripcion' => 'Clases y practica de idiomas.'],
            ['id_Categoria' => 'edu_musica', 'nombre' => 'Musica', 'grupo' => 'Educacion', 'descripcion' => 'Clases de instrumentos y teoria musical.'],
            ['id_Categoria' => 'edu_preparacion_examenes', 'nombre' => 'Preparacion Examenes', 'grupo' => 'Educacion', 'descripcion' => 'Acompanamiento para pruebas y examenes.'],

            ['id_Categoria' => 'sg_consultoria', 'nombre' => 'Consultoria', 'grupo' => 'Servicios Generales', 'descripcion' => 'Asesoria profesional especializada.'],
            ['id_Categoria' => 'sg_asesoria_legal', 'nombre' => 'Asesoria Legal', 'grupo' => 'Servicios Generales', 'descripcion' => 'Orientacion legal y juridica.'],
            ['id_Categoria' => 'sg_contabilidad', 'nombre' => 'Contabilidad', 'grupo' => 'Servicios Generales', 'descripcion' => 'Gestion contable y financiera.'],
            ['id_Categoria' => 'sg_traduccion', 'nombre' => 'Traduccion', 'grupo' => 'Servicios Generales', 'descripcion' => 'Traducciones profesionales.'],

            ['id_Categoria' => 'eve_organizacion', 'nombre' => 'Organizacion', 'grupo' => 'Eventos', 'descripcion' => 'Planeacion y logistica de eventos.'],
            ['id_Categoria' => 'eve_catering', 'nombre' => 'Catering', 'grupo' => 'Eventos', 'descripcion' => 'Alimentos y bebidas para eventos.'],
            ['id_Categoria' => 'eve_fotografia', 'nombre' => 'Fotografia', 'grupo' => 'Eventos', 'descripcion' => 'Cobertura fotografica profesional.'],
            ['id_Categoria' => 'eve_decoracion', 'nombre' => 'Decoracion', 'grupo' => 'Eventos', 'descripcion' => 'Ambientacion y decoracion tematica.'],

            ['id_Categoria' => 'ofi_carpinteria', 'nombre' => 'Carpinteria', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Trabajos en madera y muebles.'],
            ['id_Categoria' => 'ofi_pintura', 'nombre' => 'Pintura', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Pintura de espacios y acabados.'],
            ['id_Categoria' => 'ofi_albanileria', 'nombre' => 'Albanileria', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Construccion y adecuaciones civiles.'],
            ['id_Categoria' => 'ofi_reparaciones', 'nombre' => 'Reparaciones', 'grupo' => 'Oficios Manuales', 'descripcion' => 'Arreglos generales y mantenimiento.'],
        ];

        foreach ($categorias as $categoria) {
            Categoria::updateOrCreate(
                ['id_Categoria' => $categoria['id_Categoria']],
                $categoria
            );
        }
    }
}
