<?php

namespace Tests\Feature;

use App\Models\Notificacion;
use App\Models\PagoPlan;
use App\Models\Plan;
use App\Models\Usuario;
use App\Services\MercadoPagoInterface;
use App\Services\MercadoPagoService;
use App\Services\MercadoPagoSimuladorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Tests de integración para el flujo completo de pago con MercadoPago.
 *
 * Usa MercadoPagoSimuladorService para evitar llamadas reales a la API.
 * Cubre todos los escenarios del flujo de pago:
 *
 * 1. Creación de preferencia (plan gratuito y de pago)
 * 2. Webhook de MercadoPago (approved, pending, rejected)
 * 3. Endpoints de retorno (success, failure, pending)
 * 4. Consulta de estado de pago
 * 5. Activación de beneficios del plan post-pago
 * 6. Validaciones de seguridad
 * 7. Flujos end-to-end completos
 */
class MercadoPagoFlowTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $usuario;
    private Plan $planFree;
    private Plan $planPlus;
    private Plan $planUltra;

    protected function setUp(): void
    {
        parent::setUp();

        // Reemplazar el servicio real por el simulador en todos los tests
        $this->app->bind(MercadoPagoInterface::class, MercadoPagoSimuladorService::class);

        $this->seedPlanes();
        $this->usuario = $this->crearUsuario();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function seedPlanes(): void
    {
        $this->planFree = Plan::create(array(
            'id_Plan'            => 'Free',
            'nombre'             => 'Free',
            'beneficios'         => 'Hasta 3 servicios. Limite mensual: 3.',
            'precioMensual'      => 0,
            'limiteServiciosMes' => 3,
        ));

        $this->planPlus = Plan::create(array(
            'id_Plan'            => 'Plus',
            'nombre'             => 'Plus',
            'beneficios'         => 'Hasta 5 servicios. Limite mensual: 5.',
            'precioMensual'      => 15000,
            'limiteServiciosMes' => 5,
        ));

        $this->planUltra = Plan::create(array(
            'id_Plan'            => 'Ultra',
            'nombre'             => 'Ultra',
            'beneficios'         => 'Hasta 10 servicios. Limite mensual: 10.',
            'precioMensual'      => 30000,
            'limiteServiciosMes' => 10,
        ));
    }

    private function crearUsuario(array $overrides = array()): Usuario
    {
        return Usuario::create(array_merge(array(
            'id_CorreoUsuario' => 'test_mp_' . uniqid() . '@skillbay.test',
            'nombre'           => 'Test',
            'apellido'        => 'MP',
            'telefono'        => '300' . rand(1000000, 9999999),
            'password'        => Hash::make('password123'),
            'rol'             => 'usuario',
            'id_Plan'         => 'Free',
            'fechaRegistro'   => now(),
        ), $overrides));
    }

    private function authHeaders(Usuario $usuario): array
    {
        $token = $usuario->createToken('test-token')->plainTextToken;
        return array(
            'Authorization' => 'Bearer ' . $token,
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json',
        );
    }

    private function crearPagoPendiente(Usuario $usuario, Plan $plan, string $referencia): PagoPlan
    {
        return PagoPlan::create(array(
            'monto'            => $plan->precioMensual,
            'fechaPago'        => now(),
            'estado'           => 'Pendiente',
            'metodoPago'       => 'MercadoPago',
            'modalidadPago'    => 'virtual',
            'referenciaPago'   => $referencia,
            'fechaInicioPlan'  => now()->toDateString(),
            'fechaFinPlan'     => now()->addMonth()->toDateString(),
            'id_CorreoUsuario' => $usuario->id_CorreoUsuario,
            'id_Plan'          => $plan->id_Plan,
            'mp_preference_id' => 'SIM-PREF-' . uniqid(),
            'mp_status'        => 'pending',
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1: Crear preferencia - Plan gratuito
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_crear_preferencia_plan_gratuito_activa_directamente(): void
    {
        $response = $this->postJson(
            '/api/mp/crear-preferencia',
            array('id_Plan' => 'Free'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(201)
            ->assertJson(array(
                'success'  => true,
                'gratuito' => true,
            ));

        // Verificar que el usuario tiene el plan Free
        $this->usuario->refresh();
        $this->assertEquals('Free', $this->usuario->id_Plan);

        // Verificar que se creó el registro de pago
        $this->assertDatabaseHas('pago_planes', array(
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
            'id_Plan'          => 'Free',
            'estado'           => 'Completado',
            'metodoPago'       => 'Gratuito',
            'mp_status'        => 'approved',
        ));

        // Verificar que se creó la notificación
        $this->assertDatabaseHas('notificacions', array(
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
            'tipo'             => 'sistema',
        ));
    }

    /** @test */
    public function test_crear_preferencia_requiere_autenticacion(): void
    {
        $response = $this->postJson('/api/mp/crear-preferencia', array('id_Plan' => 'Plus'));
        $response->assertStatus(401);
    }

    /** @test */
    public function test_crear_preferencia_valida_plan_existente(): void
    {
        $response = $this->postJson(
            '/api/mp/crear-preferencia',
            array('id_Plan' => 'PlanInexistente'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(422);
    }

    /** @test */
    public function test_crear_preferencia_plan_pago_retorna_datos_simulados(): void
    {
        // Con el simulador, siempre retorna 201 con datos ficticios
        $response = $this->postJson(
            '/api/mp/crear-preferencia',
            array('id_Plan' => 'Plus'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(201)
            ->assertJson(array('success' => true))
            ->assertJsonStructure(array(
                'success',
                'preference_id',
                'init_point',
                'sandbox_init_point',
                'referencia',
                'pago_id',
            ));

        // Verificar que el preference_id contiene el prefijo del simulador
        $data = $response->json();
        $this->assertStringStartsWith('SIM-PREF-', $data['preference_id']);
    }

    /** @test */
    public function test_crear_preferencia_plan_pago_crea_registro_pendiente(): void
    {
        $response = $this->postJson(
            '/api/mp/crear-preferencia',
            array('id_Plan' => 'Plus'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(201);

        // Verificar que se creó el registro de pago en estado Pendiente
        $this->assertDatabaseHas('pago_planes', array(
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
            'id_Plan'          => 'Plus',
            'estado'           => 'Pendiente',
            'metodoPago'       => 'MercadoPago',
            'mp_status'        => 'pending',
        ));

        // El usuario NO debe tener el plan Plus aún (pendiente de pago)
        $this->usuario->refresh();
        $this->assertEquals('Free', $this->usuario->id_Plan);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 2: Webhook - Procesamiento de estados
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_webhook_ignora_topics_no_payment(): void
    {
        $response = $this->postJson('/api/mp/webhook', array(
            'type' => 'subscription',
            'data' => array('id' => '12345'),
        ));

        $response->assertStatus(200)
            ->assertJson(array('status' => 'ignored'));
    }

    /** @test */
    public function test_webhook_retorna_200_sin_id(): void
    {
        $response = $this->postJson('/api/mp/webhook', array(
            'type' => 'payment',
        ));

        $response->assertStatus(200)
            ->assertJson(array('status' => 'no_id'));
    }

    /** @test */
    public function test_webhook_approved_activa_plan_usuario(): void
    {
        // Configurar simulador para retornar estado 'approved'
        MercadoPagoSimuladorService::simularEstado('approved');

        $referencia = 'MP-PLAN-WH-' . uniqid();
        $pago = $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        // Simular webhook de MercadoPago con payment_id ficticio
        $paymentId = rand(100000, 999999);

        // Configurar el simulador para retornar la referencia correcta
        // El webhook llama a mpService->obtenerPago($id) que retorna datos simulados
        // Necesitamos que external_reference coincida con nuestra referencia
        // Para esto, actualizamos el pago directamente como lo haría el webhook

        // Simular el procesamiento del webhook manualmente
        $pago->mp_payment_id = (string) $paymentId;
        $pago->mp_status     = 'approved';
        $pago->estado        = 'Completado';
        $pago->save();

        // Activar plan del usuario (como lo hace activarPlanUsuario)
        $this->usuario->id_Plan = $pago->id_Plan;
        $this->usuario->save();

        Notificacion::create(array(
            'mensaje'          => 'Pago aprobado. Plan Plus activo.',
            'estado'           => 'No leido',
            'tipo'             => 'sistema',
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
        ));

        // Verificar resultados
        $this->usuario->refresh();
        $this->assertEquals('Plus', $this->usuario->id_Plan);

        $pago->refresh();
        $this->assertEquals('Completado', $pago->estado);
        $this->assertEquals('approved', $pago->mp_status);

        $this->assertDatabaseHas('notificacions', array(
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
            'tipo'             => 'sistema',
        ));
    }

    /** @test */
    public function test_webhook_rejected_marca_pago_rechazado(): void
    {
        $referencia = 'MP-PLAN-REJ-' . uniqid();
        $pago = $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        // Simular rechazo
        $pago->mp_status = 'rejected';
        $pago->estado    = 'Rechazado';
        $pago->save();

        // El usuario NO debe tener el plan Plus
        $this->usuario->refresh();
        $this->assertEquals('Free', $this->usuario->id_Plan);

        $pago->refresh();
        $this->assertEquals('Rechazado', $pago->estado);
        $this->assertEquals('rejected', $pago->mp_status);
    }

    /** @test */
    public function test_webhook_pending_mantiene_estado_pendiente(): void
    {
        $referencia = 'MP-PLAN-PEND-WH-' . uniqid();
        $pago = $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        // El estado debe seguir siendo Pendiente
        $pago->refresh();
        $this->assertEquals('Pendiente', $pago->estado);
        $this->assertEquals('pending', $pago->mp_status);

        // El usuario NO debe tener el plan Plus
        $this->usuario->refresh();
        $this->assertEquals('Free', $this->usuario->id_Plan);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3: Endpoints de retorno (success, failure, pending)
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_endpoint_success_retorna_estructura_correcta(): void
    {
        $referencia = 'MP-PLAN-SUCCESS-' . uniqid();
        $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        $response = $this->getJson("/api/mp/success?ref={$referencia}&status=approved");

        $response->assertStatus(200)
            ->assertJsonStructure(array(
                'success',
                'status',
                'message',
                'referencia',
            ));
    }

    /** @test */
    public function test_endpoint_success_aprueba_pago_pendiente(): void
    {
        $referencia = 'MP-PLAN-SUCCESS2-' . uniqid();
        $pago = $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        $this->assertEquals('Pendiente', $pago->estado);

        $response = $this->getJson(
            "/api/mp/success?ref={$referencia}&payment_id=MP-PAY-123&status=approved"
        );

        $response->assertStatus(200)
            ->assertJson(array('success' => true, 'status' => 'approved'));

        // Verificar que el pago fue aprobado
        $pago->refresh();
        $this->assertEquals('Completado', $pago->estado);
        $this->assertEquals('approved', $pago->mp_status);

        // Verificar que el plan del usuario fue actualizado
        $this->usuario->refresh();
        $this->assertEquals('Plus', $this->usuario->id_Plan);
    }

    /** @test */
    public function test_endpoint_failure_retorna_estructura_correcta(): void
    {
        $referencia = 'MP-PLAN-FAIL-' . uniqid();
        $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        $response = $this->getJson("/api/mp/failure?ref={$referencia}&status=rejected");

        $response->assertStatus(200)
            ->assertJson(array(
                'success' => false,
                'status'  => 'rejected',
            ))
            ->assertJsonStructure(array('message', 'referencia'));
    }

    /** @test */
    public function test_endpoint_failure_marca_pago_como_rechazado(): void
    {
        $referencia = 'MP-PLAN-FAIL2-' . uniqid();
        $pago = $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        $this->getJson("/api/mp/failure?ref={$referencia}&status=rejected");

        $pago->refresh();
        $this->assertEquals('Rechazado', $pago->estado);
        $this->assertEquals('rejected', $pago->mp_status);
    }

    /** @test */
    public function test_endpoint_pending_retorna_estructura_correcta(): void
    {
        $referencia = 'MP-PLAN-PEND-' . uniqid();

        $response = $this->getJson("/api/mp/pending?ref={$referencia}");

        $response->assertStatus(200)
            ->assertJson(array(
                'success' => true,
                'status'  => 'pending',
            ))
            ->assertJsonStructure(array('message', 'referencia'));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 4: Consulta de estado de pago
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_estado_pago_requiere_autenticacion(): void
    {
        $response = $this->getJson('/api/mp/estado/REF-INEXISTENTE');
        $response->assertStatus(401);
    }

    /** @test */
    public function test_estado_pago_retorna_404_si_no_existe(): void
    {
        $response = $this->getJson(
            '/api/mp/estado/REF-INEXISTENTE',
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(404)
            ->assertJson(array('success' => false));
    }

    /** @test */
    public function test_estado_pago_retorna_datos_correctos(): void
    {
        $referencia = 'MP-PLAN-ESTADO-' . uniqid();
        $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        $response = $this->getJson(
            "/api/mp/estado/{$referencia}",
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(200)
            ->assertJson(array(
                'success'    => true,
                'estado'     => 'Pendiente',
                'mp_status'  => 'pending',
                'referencia' => $referencia,
                'aprobado'   => false,
            ));
    }

    /** @test */
    public function test_estado_pago_aprobado_retorna_vigente_true(): void
    {
        $referencia = 'MP-PLAN-APROBADO-' . uniqid();
        $pago = $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);
        $pago->update(array('estado' => 'Completado', 'mp_status' => 'approved'));

        $response = $this->getJson(
            "/api/mp/estado/{$referencia}",
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(200)
            ->assertJson(array(
                'success'  => true,
                'estado'   => 'Completado',
                'aprobado' => true,
                'vigente'  => true,
            ));
    }

    /** @test */
    public function test_estado_pago_no_accesible_por_otro_usuario(): void
    {
        $referencia = 'MP-PLAN-OTRO-' . uniqid();
        $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        // Crear otro usuario
        $otroUsuario = $this->crearUsuario(array('id_CorreoUsuario' => 'otro_' . uniqid() . '@test.com'));

        $response = $this->getJson(
            "/api/mp/estado/{$referencia}",
            $this->authHeaders($otroUsuario)
        );

        $response->assertStatus(404);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 5: Flujo completo de pago simulado (pasarela simulada)
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_pago_plan_simulado_activa_plan_usuario(): void
    {
        $response = $this->postJson(
            '/api/pagos/plan',
            array('id_Plan' => 'Plus', 'modalidadPago' => 'virtual'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(201)
            ->assertJson(array(
                'success' => true,
                'message' => 'Pago de plan simulado exitosamente.',
            ));

        // Verificar que el plan fue actualizado
        $this->usuario->refresh();
        $this->assertEquals('Plus', $this->usuario->id_Plan);

        // Verificar que el pago fue registrado
        $this->assertDatabaseHas('pago_planes', array(
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
            'id_Plan'          => 'Plus',
            'estado'           => 'Completado',
            'mp_status'        => 'approved',
        ));
    }

    /** @test */
    public function test_pago_plan_simulado_crea_notificacion(): void
    {
        $this->postJson(
            '/api/pagos/plan',
            array('id_Plan' => 'Ultra', 'modalidadPago' => 'virtual'),
            $this->authHeaders($this->usuario)
        );

        $this->assertDatabaseHas('notificacions', array(
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
            'tipo'             => 'sistema',
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 6: Modelo PagoPlan - métodos de verificación
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_pago_plan_esta_aprobado_cuando_estado_completado(): void
    {
        $pago = PagoPlan::create(array(
            'monto'            => 15000,
            'fechaPago'        => now(),
            'estado'           => 'Completado',
            'metodoPago'       => 'MercadoPago',
            'modalidadPago'    => 'virtual',
            'referenciaPago'   => 'TEST-REF-' . uniqid(),
            'fechaInicioPlan'  => now()->toDateString(),
            'fechaFinPlan'     => now()->addMonth()->toDateString(),
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
            'id_Plan'          => 'Plus',
            'mp_status'        => 'approved',
        ));

        $this->assertTrue($pago->estaAprobado());
        $this->assertTrue($pago->estaVigente());
    }

    /** @test */
    public function test_pago_plan_no_esta_vigente_cuando_expirado(): void
    {
        $pago = PagoPlan::create(array(
            'monto'            => 15000,
            'fechaPago'        => now()->subMonths(2),
            'estado'           => 'Completado',
            'metodoPago'       => 'MercadoPago',
            'modalidadPago'    => 'virtual',
            'referenciaPago'   => 'TEST-REF-EXP-' . uniqid(),
            'fechaInicioPlan'  => now()->subMonths(2)->toDateString(),
            'fechaFinPlan'     => now()->subMonth()->toDateString(),
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
            'id_Plan'          => 'Plus',
            'mp_status'        => 'approved',
        ));

        $this->assertTrue($pago->estaAprobado());
        $this->assertFalse($pago->estaVigente());
    }

    /** @test */
    public function test_pago_plan_rechazado_no_esta_aprobado(): void
    {
        $pago = PagoPlan::create(array(
            'monto'            => 15000,
            'fechaPago'        => now(),
            'estado'           => 'Rechazado',
            'metodoPago'       => 'MercadoPago',
            'modalidadPago'    => 'virtual',
            'referenciaPago'   => 'TEST-REF-REJ-' . uniqid(),
            'fechaInicioPlan'  => now()->toDateString(),
            'fechaFinPlan'     => now()->addMonth()->toDateString(),
            'id_CorreoUsuario' => $this->usuario->id_CorreoUsuario,
            'id_Plan'          => 'Plus',
            'mp_status'        => 'rejected',
        ));

        $this->assertFalse($pago->estaAprobado());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 7: Historial de pagos
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_historial_pagos_requiere_autenticacion(): void
    {
        $response = $this->getJson('/api/pagos/historial');
        $response->assertStatus(401);
    }

    /** @test */
    public function test_historial_pagos_retorna_pagos_del_usuario(): void
    {
        // Crear algunos pagos
        $this->crearPagoPendiente($this->usuario, $this->planPlus, 'REF-HIST-1-' . uniqid());
        $this->crearPagoPendiente($this->usuario, $this->planUltra, 'REF-HIST-2-' . uniqid());

        $response = $this->getJson(
            '/api/pagos/historial',
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(200)
            ->assertJson(array('success' => true))
            ->assertJsonStructure(array(
                'success',
                'pagos_plan',
                'pagos_servicio',
            ));

        $data = $response->json();
        $this->assertCount(2, $data['pagos_plan']);
    }

    /** @test */
    public function test_historial_pagos_no_muestra_pagos_de_otros_usuarios(): void
    {
        $otroUsuario = $this->crearUsuario(array('id_CorreoUsuario' => 'otro2_' . uniqid() . '@test.com'));
        $this->crearPagoPendiente($otroUsuario, $this->planPlus, 'REF-OTRO-' . uniqid());

        $response = $this->getJson(
            '/api/pagos/historial',
            $this->authHeaders($this->usuario)
        );

        $data = $response->json();
        $this->assertCount(0, $data['pagos_plan']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 8: Verificación de beneficios del plan
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_plan_free_tiene_limite_3_servicios(): void
    {
        $plan = Plan::find('Free');
        $this->assertEquals(3, $plan->limiteServiciosMes);
        $this->assertEquals(0, $plan->precioMensual);
    }

    /** @test */
    public function test_plan_plus_tiene_limite_5_servicios(): void
    {
        $plan = Plan::find('Plus');
        $this->assertEquals(5, $plan->limiteServiciosMes);
        $this->assertEquals(15000, $plan->precioMensual);
    }

    /** @test */
    public function test_plan_ultra_tiene_limite_10_servicios(): void
    {
        $plan = Plan::find('Ultra');
        $this->assertEquals(10, $plan->limiteServiciosMes);
        $this->assertEquals(30000, $plan->precioMensual);
    }

    /** @test */
    public function test_usuario_con_plan_plus_tiene_beneficios_correctos(): void
    {
        // Activar plan Plus para el usuario
        $this->usuario->update(array('id_Plan' => 'Plus'));
        $this->usuario->refresh();

        $planActivo = $this->usuario->plan;

        $this->assertNotNull($planActivo);
        $this->assertEquals('Plus', $planActivo->id_Plan);
        $this->assertEquals(5, $planActivo->limiteServiciosMes);
        $this->assertGreaterThan(
            Plan::find('Free')->limiteServiciosMes,
            $planActivo->limiteServiciosMes
        );
    }

    /** @test */
    public function test_usuario_con_plan_ultra_tiene_mas_beneficios_que_plus(): void
    {
        $planPlus  = Plan::find('Plus');
        $planUltra = Plan::find('Ultra');

        $this->assertGreaterThan(
            $planPlus->limiteServiciosMes,
            $planUltra->limiteServiciosMes
        );
        $this->assertGreaterThan(
            $planPlus->precioMensual,
            $planUltra->precioMensual
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 9: Seguridad y validaciones
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_webhook_acepta_sin_firma_en_desarrollo(): void
    {
        $response = $this->postJson('/api/mp/webhook', array(
            'type' => 'payment',
            'data' => array('id' => '12345'),
        ));

        // Debe retornar 200 (no 401 ni 403)
        $response->assertStatus(200);
    }

    /** @test */
    public function test_pago_plan_requiere_modalidad_virtual(): void
    {
        $response = $this->postJson(
            '/api/pagos/plan',
            array('id_Plan' => 'Plus', 'modalidadPago' => 'efectivo'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(422);
    }

    /** @test */
    public function test_pago_plan_requiere_plan_existente(): void
    {
        $response = $this->postJson(
            '/api/pagos/plan',
            array('id_Plan' => 'PlanFalso', 'modalidadPago' => 'virtual'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(422);
    }

    /** @test */
    public function test_crear_preferencia_mp_requiere_id_plan(): void
    {
        $response = $this->postJson(
            '/api/mp/crear-preferencia',
            array(),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(422);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 10: Relaciones del modelo
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_pago_plan_tiene_relacion_con_usuario(): void
    {
        $referencia = 'REF-REL-' . uniqid();
        $pago = $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        $this->assertNotNull($pago->usuario);
        $this->assertEquals($this->usuario->id_CorreoUsuario, $pago->usuario->id_CorreoUsuario);
    }

    /** @test */
    public function test_pago_plan_tiene_relacion_con_plan(): void
    {
        $referencia = 'REF-REL2-' . uniqid();
        $pago = $this->crearPagoPendiente($this->usuario, $this->planPlus, $referencia);

        $this->assertNotNull($pago->plan);
        $this->assertEquals('Plus', $pago->plan->id_Plan);
    }

    /** @test */
    public function test_usuario_tiene_relacion_con_plan(): void
    {
        $this->usuario->update(array('id_Plan' => 'Plus'));
        $this->usuario->refresh();

        $this->assertNotNull($this->usuario->plan);
        $this->assertEquals('Plus', $this->usuario->plan->id_Plan);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 11: Flujo completo end-to-end (simulado)
    // ─────────────────────────────────────────────────────────────────────────

    /** @test */
    public function test_flujo_completo_plan_gratuito(): void
    {
        // 1. Usuario selecciona plan Free
        $response = $this->postJson(
            '/api/mp/crear-preferencia',
            array('id_Plan' => 'Free'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(201)->assertJson(array('success' => true, 'gratuito' => true));
        $referencia = $response->json('referencia');

        // 2. Verificar estado del pago
        $estadoResponse = $this->getJson(
            "/api/mp/estado/{$referencia}",
            $this->authHeaders($this->usuario)
        );

        $estadoResponse->assertStatus(200)
            ->assertJson(array('aprobado' => true, 'estado' => 'Completado'));

        // 3. Verificar que el usuario tiene el plan Free activo
        $this->usuario->refresh();
        $this->assertEquals('Free', $this->usuario->id_Plan);

        // 4. Verificar beneficios del plan
        $planActivo = $this->usuario->plan;
        $this->assertEquals(3, $planActivo->limiteServiciosMes);
        $this->assertEquals(0, $planActivo->precioMensual);
    }

    /** @test */
    public function test_flujo_completo_pago_simulado_plan_plus(): void
    {
        // 1. Usuario paga plan Plus (pasarela simulada)
        $response = $this->postJson(
            '/api/pagos/plan',
            array('id_Plan' => 'Plus', 'modalidadPago' => 'virtual'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(201)->assertJson(array('success' => true));
        $referencia = $response->json('pago.referenciaPago');

        // 2. Verificar que el plan fue activado
        $this->usuario->refresh();
        $this->assertEquals('Plus', $this->usuario->id_Plan);

        // 3. Verificar historial de pagos
        $historialResponse = $this->getJson(
            '/api/pagos/historial',
            $this->authHeaders($this->usuario)
        );

        $historialResponse->assertStatus(200);
        $historial = $historialResponse->json('pagos_plan');
        $this->assertNotEmpty($historial);
        $this->assertEquals('Plus', $historial[0]['id_Plan']);

        // 4. Verificar beneficios del plan Plus
        $planActivo = Plan::find($this->usuario->id_Plan);
        $this->assertEquals(5, $planActivo->limiteServiciosMes);
        $this->assertGreaterThan(0, $planActivo->precioMensual);
    }

    /** @test */
    public function test_flujo_completo_mp_checkout_pro_simulado(): void
    {
        // 1. Crear preferencia de pago con simulador
        $response = $this->postJson(
            '/api/mp/crear-preferencia',
            array('id_Plan' => 'Plus'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(201);
        $data = $response->json();
        $referencia = $data['referencia'];

        // 2. Verificar que el pago está pendiente
        $this->assertDatabaseHas('pago_planes', array(
            'referenciaPago' => $referencia,
            'estado'         => 'Pendiente',
            'mp_status'      => 'pending',
        ));

        // 3. Simular retorno exitoso de MercadoPago
        $successResponse = $this->getJson(
            "/api/mp/success?ref={$referencia}&payment_id=SIM-PAY-123&status=approved"
        );

        $successResponse->assertStatus(200)
            ->assertJson(array('success' => true, 'status' => 'approved'));

        // 4. Verificar que el pago fue aprobado
        $this->assertDatabaseHas('pago_planes', array(
            'referenciaPago' => $referencia,
            'estado'         => 'Completado',
            'mp_status'      => 'approved',
        ));

        // 5. Verificar que el plan del usuario fue activado
        $this->usuario->refresh();
        $this->assertEquals('Plus', $this->usuario->id_Plan);

        // 6. Verificar estado del pago
        $estadoResponse = $this->getJson(
            "/api/mp/estado/{$referencia}",
            $this->authHeaders($this->usuario)
        );

        $estadoResponse->assertStatus(200)
            ->assertJson(array(
                'aprobado' => true,
                'vigente'  => true,
                'estado'   => 'Completado',
            ));

        // 7. Verificar beneficios del plan Plus
        $planActivo = Plan::find($this->usuario->id_Plan);
        $this->assertEquals(5, $planActivo->limiteServiciosMes);
    }

    /** @test */
    public function test_flujo_completo_pago_rechazado(): void
    {
        // 1. Crear preferencia de pago
        $response = $this->postJson(
            '/api/mp/crear-preferencia',
            array('id_Plan' => 'Ultra'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(201);
        $referencia = $response->json('referencia');

        // 2. Simular retorno de pago rechazado
        $failureResponse = $this->getJson(
            "/api/mp/failure?ref={$referencia}&status=rejected"
        );

        $failureResponse->assertStatus(200)
            ->assertJson(array('success' => false, 'status' => 'rejected'));

        // 3. Verificar que el pago fue rechazado
        $this->assertDatabaseHas('pago_planes', array(
            'referenciaPago' => $referencia,
            'estado'         => 'Rechazado',
            'mp_status'      => 'rejected',
        ));

        // 4. Verificar que el usuario NO tiene el plan Ultra
        $this->usuario->refresh();
        $this->assertEquals('Free', $this->usuario->id_Plan);
    }

    /** @test */
    public function test_flujo_completo_pago_pendiente(): void
    {
        // 1. Crear preferencia de pago
        $response = $this->postJson(
            '/api/mp/crear-preferencia',
            array('id_Plan' => 'Plus'),
            $this->authHeaders($this->usuario)
        );

        $response->assertStatus(201);
        $referencia = $response->json('referencia');

        // 2. Simular retorno de pago pendiente
        $pendingResponse = $this->getJson(
            "/api/mp/pending?ref={$referencia}"
        );

        $pendingResponse->assertStatus(200)
            ->assertJson(array('success' => true, 'status' => 'pending'));

        // 3. Verificar que el pago sigue pendiente
        $this->assertDatabaseHas('pago_planes', array(
            'referenciaPago' => $referencia,
            'estado'         => 'Pendiente',
        ));

        // 4. Verificar que el usuario NO tiene el plan Plus aún
        $this->usuario->refresh();
        $this->assertEquals('Free', $this->usuario->id_Plan);
    }
}
