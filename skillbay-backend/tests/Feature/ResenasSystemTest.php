<?php

namespace Tests\Feature;

use App\Models\Postulacion;
use App\Models\Resena;
use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResenasSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_cambio_de_rol_no_ocurre_al_postular(): void
    {
        $cliente = Usuario::create([
            'id_CorreoUsuario' => 'cliente@test.com',
            'nombre' => 'Cliente',
            'apellido' => 'Test',
            'password' => bcrypt('password'),
            'rol' => 'cliente',
            'fechaRegistro' => now()->toDateString(),
        ]);

        $ofertante = Usuario::create([
            'id_CorreoUsuario' => 'ofertante@test.com',
            'nombre' => 'Ofertante',
            'apellido' => 'Test',
            'password' => bcrypt('password'),
            'rol' => 'ofertante',
            'fechaRegistro' => now()->toDateString(),
        ]);

        $servicio = Servicio::create([
            'titulo' => 'Test Service',
            'descripcion' => 'Test Description',
            'precio' => 100000,
            'id_Dueno' => $ofertante->id_CorreoUsuario,
            'id_Categoria' => 'tec_desarrollo_web',
            'tipo' => 'servicio',
            'estado' => 'activo',
            'ciudad' => 'Test City',
            'departamento' => 'Test State',
        ]);

        $this->actingAs($cliente, 'sanctum');

        $response = $this->postJson('/api/postulaciones', [
            'id_Servicio' => $servicio->id_Servicio,
            'mensaje' => 'Me interesa este servicio',
            'presupuesto' => 100000,
            'tiempo_estimado' => '2 días',
        ]);

        $response->assertStatus(201);

        $cliente->refresh();
        $this->assertEquals('cliente', $cliente->rol);
    }

    public function test_cambio_de_rol_ocurre_al_aceptar_postulacion(): void
    {
        $cliente = Usuario::create([
            'id_CorreoUsuario' => 'cliente2@test.com',
            'nombre' => 'Cliente',
            'apellido' => 'Test',
            'password' => bcrypt('password'),
            'rol' => 'cliente',
            'fechaRegistro' => now()->toDateString(),
        ]);

        $ofertante = Usuario::create([
            'id_CorreoUsuario' => 'ofertante2@test.com',
            'nombre' => 'Ofertante',
            'apellido' => 'Test',
            'password' => bcrypt('password'),
            'rol' => 'ofertante',
            'fechaRegistro' => now()->toDateString(),
        ]);

        $servicio = Servicio::create([
            'titulo' => 'Test Service 2',
            'descripcion' => 'Test Description',
            'precio' => 100000,
            'id_Dueno' => $ofertante->id_CorreoUsuario,
            'id_Categoria' => 'tec_desarrollo_web',
            'tipo' => 'servicio',
            'estado' => 'activo',
            'ciudad' => 'Test City',
            'departamento' => 'Test State',
        ]);

        $postulacion = Postulacion::create([
            'id_Servicio' => $servicio->id_Servicio,
            'id_Usuario' => $cliente->id_CorreoUsuario,
            'mensaje' => 'Me postulo',
            'estado' => 'pendiente',
            'tipo_postulacion' => 'postulante',
        ]);

        $this->actingAs($ofertante, 'sanctum');

        $response = $this->patchJson("/api/servicios/solicitudes/{$postulacion->id}/estado", [
            'estado' => 'aceptada',
        ]);

        $response->assertStatus(200);

        $cliente->refresh();
        $this->assertEquals('ofertante', $cliente->rol);
    }

    public function test_resenas_tienen_calificado_correcto(): void
    {
        $cliente = Usuario::create([
            'id_CorreoUsuario' => 'cliente3@test.com',
            'nombre' => 'Cliente',
            'apellido' => 'Test',
            'password' => bcrypt('password'),
            'rol' => 'cliente',
            'fechaRegistro' => now()->toDateString(),
        ]);

        $ofertante = Usuario::create([
            'id_CorreoUsuario' => 'ofertante3@test.com',
            'nombre' => 'Ofertante',
            'apellido' => 'Test',
            'password' => bcrypt('password'),
            'rol' => 'ofertante',
            'fechaRegistro' => now()->toDateString(),
        ]);

        $servicio = Servicio::create([
            'titulo' => 'Test Service 3',
            'descripcion' => 'Test Description',
            'precio' => 100000,
            'id_Dueno' => $ofertante->id_CorreoUsuario,
            'id_Categoria' => 'tec_desarrollo_web',
            'tipo' => 'servicio',
            'estado' => 'activo',
            'ciudad' => 'Test City',
            'departamento' => 'Test State',
        ]);

        $postulacion = Postulacion::create([
            'id_Servicio' => $servicio->id_Servicio,
            'id_Usuario' => $cliente->id_CorreoUsuario,
            'mensaje' => 'Me postulo',
            'estado' => 'aceptada',
            'tipo_postulacion' => 'postulante',
        ]);

        $this->actingAs($cliente, 'sanctum');

        $response = $this->postJson('/api/resenas', [
            'id_Servicio' => $servicio->id_Servicio,
            'calificacion_usuario' => 5,
            'calificacion_servicio' => 4,
            'comentario' => 'Excelente servicio',
            'id_Postulacion' => $postulacion->id,
        ]);

        $response->assertStatus(201);

        $resena = Resena::first();

        $this->assertNotEquals($resena->id_CorreoUsuario, $resena->id_CorreoUsuario_Calificado);
        $this->assertEquals($resena->id_CorreoUsuario_Calificado, $ofertante->id_CorreoUsuario);
    }

    public function test_promedio_calculos_correctos(): void
    {
        $ofertante = Usuario::create([
            'id_CorreoUsuario' => 'ofertante4@test.com',
            'nombre' => 'Ofertante',
            'apellido' => 'Test',
            'password' => bcrypt('password'),
            'rol' => 'ofertante',
            'fechaRegistro' => now()->toDateString(),
        ]);

        $cliente1 = Usuario::create([
            'id_CorreoUsuario' => 'cliente4a@test.com',
            'nombre' => 'Cliente A',
            'apellido' => 'Test',
            'password' => bcrypt('password'),
            'rol' => 'cliente',
            'fechaRegistro' => now()->toDateString(),
        ]);

        $cliente2 = Usuario::create([
            'id_CorreoUsuario' => 'cliente4b@test.com',
            'nombre' => 'Cliente B',
            'apellido' => 'Test',
            'password' => bcrypt('password'),
            'rol' => 'cliente',
            'fechaRegistro' => now()->toDateString(),
        ]);

        $servicio = Servicio::create([
            'titulo' => 'Test Service 4',
            'descripcion' => 'Test Description',
            'precio' => 100000,
            'id_Dueno' => $ofertante->id_CorreoUsuario,
            'id_Categoria' => 'tec_desarrollo_web',
            'tipo' => 'servicio',
            'estado' => 'activo',
            'ciudad' => 'Test City',
            'departamento' => 'Test State',
        ]);

        Resena::create([
            'id_Servicio' => $servicio->id_Servicio,
            'calificacion_usuario' => 5,
            'calificacion_servicio' => 4,
            'id_CorreoUsuario' => $cliente1->id_CorreoUsuario,
            'id_CorreoUsuario_Calificado' => $ofertante->id_CorreoUsuario,
        ]);

        Resena::create([
            'id_Servicio' => $servicio->id_Servicio,
            'calificacion_usuario' => 4,
            'calificacion_servicio' => 5,
            'id_CorreoUsuario' => $cliente2->id_CorreoUsuario,
            'id_CorreoUsuario_Calificado' => $ofertante->id_CorreoUsuario,
        ]);

        $response = $this->getJson("/api/resenas/usuario/{$ofertante->id_CorreoUsuario}/promedio");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'promedio' => [
                'como_ofertante',
                'count_ofertante',
                'como_cliente',
                'count_cliente',
                'servicio',
                'general',
                'total_resenas',
            ],
        ]);

        $promedio = $response->json('promedio');
        $this->assertEquals(4.5, $promedio['general']);
    }
}
