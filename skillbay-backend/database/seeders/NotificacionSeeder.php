<?php

namespace Database\Seeders;

use App\Models\Notificacion;
use App\Models\Usuario;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificacionSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Notificacion::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $faker = Faker::create('es_CO');

        $tipos = [
            'servicio' => 30,
            'postulacion' => 25,
            'pago' => 20,
            'cuenta' => 15,
            'admin' => 10,
        ];

        $mensajesPorTipo = [
            'servicio' => [
                'Tu servicio "{titulo}" ha sido publicado correctamente.',
                'Alguien ha mostrado interes en tu servicio "{titulo}".',
                'Tu servicio "{titulo}" ha sido actualizado.',
                'Tu servicio "{titulo}" ha sido eliminado por el administrador.',
                'El estado de tu servicio "{titulo}" ha cambiado.',
            ],
            'postulacion' => [
                'Nueva postulacion para tu servicio "{titulo}".',
                'Tu postulacion ha sido aceptada para "{titulo}".',
                'Tu postulacion ha sido rechazada para "{titulo}".',
                'Actualizacion en tu postulacion para "{titulo}".',
                'Tienes un nuevo mensaje relacionado con "{titulo}".',
            ],
            'pago' => [
                'Tu pago de ${monto} ha sido procesado exitosamente.',
                'Has recibido un pago de ${monto} por tu servicio.',
                'Tu pago esta pendiente de confirmación.',
                'El pago para "{titulo}" ha sido completado.',
                'Ha ocurrido un problema con tu pago. Contacta soporte.',
            ],
            'cuenta' => [
                'Tu plan ha sido actualizado exitosamente.',
                'Tu suscripcion sera renovada pronto.',
                'Tu cuenta ha sido verificada.',
                'Tu plan gratuito esta por vencer. Considera mejorar.',
                'Bienvenido a SkillBay! Empieza a usar la plataforma.',
            ],
            'admin' => [
                'Nuevo reporte recibido en la plataforma.',
                'Tu cuenta ha sido revisada por administración.',
                'Se ha actualizado la política de la plataforma.',
                'Recuerda completar tu perfil para más visibilidad.',
                'Manten tu información actualizada para mejor servicio.',
            ],
        ];

        $usuarios = Usuario::where('rol', '!=', 'admin')
            ->where('id_CorreoUsuario', 'like', '%@skillbay.com')
            ->get();

        if ($usuarios->isEmpty()) {
            $this->command->info('No hay usuarios para crear notificaciones.');
            return;
        }

        // Crear 20-35 notificaciones
        $numNotificaciones = rand(20, 35);

        for ($i = 0; $i < $numNotificaciones; $i++) {
            $usuario = $usuarios->random();
            $tipo = $this->weightedRandom($tipos);
            $mensajeTemplate = $faker->randomElement($mensajesPorTipo[$tipo]);
            
            // Reemplazar placeholders
            $mensaje = str_replace('{titulo}', $faker->randomElement([
                'Desarrollo Web', 'Diseño Logo', 'Marketing Digital', 
                'Soporte Técnico', 'Consultoría', 'Diseño UI/UX'
            ]), $mensajeTemplate);
            $mensaje = str_replace('${monto}', '$' . number_format($faker->numberBetween(50000, 2000000), 0), $mensaje);

            // Estado: mayor probabilidad de "Leido" para notificaciones más antiguas
            $createdAt = $faker->dateTimeBetween('-1 month', 'now');
            $diasOld = (time() - $createdAt->getTimestamp()) / 86400;
            $estado = $diasOld > 5 ? $faker->randomElement(['Leido', 'Leido']) : $faker->randomElement(['No leido', 'Leido']);

            Notificacion::create([
                'mensaje' => $mensaje,
                'fecha' => $createdAt,
                'estado' => $estado,
                'tipo' => $tipo,
                'id_CorreoUsuario' => $usuario->id_CorreoUsuario,
            ]);
        }

        // Crear algunas notificaciones de "sistema" para usuarios específicos importantes
        $usuariosImportantes = ['cliente@skillbay.com', 'ofertante@skillbay.com', 'cliente2@skillbay.com'];
        foreach ($usuariosImportantes as $email) {
            $usuario = $usuarios->firstWhere('id_CorreoUsuario', $email);
            if (!$usuario) continue;

            Notificacion::create([
                'mensaje' => 'Bienvenido a SkillBay! Explora los mejores servicios y oportunidades.',
                'fecha' => now()->subDays(rand(1, 5)),
                'estado' => 'Leido',
                'tipo' => 'cuenta',
                'id_CorreoUsuario' => $email,
            ]);
        }

        $this->command->info('Se crearon ' . Notificacion::count() . ' registros de notificaciones.');
    }

    private function weightedRandom(array $weights): string
    {
        $total = array_sum($weights);
        $random = rand(1, $total);
        $running = 0;
        foreach ($weights as $tipo => $weight) {
            $running += $weight;
            if ($random <= $running) {
                return $tipo;
            }
        }
        return 'servicio';
    }
}