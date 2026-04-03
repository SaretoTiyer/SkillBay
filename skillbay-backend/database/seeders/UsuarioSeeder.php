<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = [];

        // ========== ADMIN ==========
        $usuarios[] = [
            'id_CorreoUsuario' => 'admin@skillbay.com',
            'nombre' => 'Admin',
            'apellido' => 'SkillBay',
            'genero' => 'Masculino',
            'telefono' => '+573000000001',
            'ciudad' => 'Bogota',
            'departamento' => 'Cundinamarca',
            'fechaNacimiento' => '1985-06-15',
            'password' => Hash::make('password123'),
            'rol' => 'admin',
            'bloqueado' => false,
            'id_Plan' => 'Enterprise',
            'imagen_perfil' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
        ];

        // ========== CLIENTES ==========
        // Cliente 1 - Plus
        $usuarios[] = [
            'id_CorreoUsuario' => 'cliente@skillbay.com',
            'nombre' => 'Carlos',
            'apellido' => 'Martinez',
            'genero' => 'Masculino',
            'telefono' => '+573000000002',
            'ciudad' => 'Medellin',
            'departamento' => 'Antioquia',
            'fechaNacimiento' => '1990-03-22',
            'password' => Hash::make('password123'),
            'rol' => 'cliente',
            'bloqueado' => false,
            'id_Plan' => 'Plus',
            'imagen_perfil' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
            'nequi_numero' => '3210000001',
            'nequi_nombre' => 'Carlos Martinez',
        ];

        // Cliente 2 - Ultra
        $usuarios[] = [
            'id_CorreoUsuario' => 'cliente2@skillbay.com',
            'nombre' => 'Ana',
            'apellido' => 'Rodriguez',
            'genero' => 'Femenino',
            'telefono' => '+573000000003',
            'ciudad' => 'Cali',
            'departamento' => 'Valle del Cauca',
            'fechaNacimiento' => '1988-11-08',
            'password' => Hash::make('password123'),
            'rol' => 'cliente',
            'bloqueado' => false,
            'id_Plan' => 'Ultra',
            'imagen_perfil' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
            'nequi_numero' => '3210000002',
            'nequi_nombre' => 'Ana Rodriguez',
            'bancolombia_qr' => 'https://images.unsplash.com/photo-1563013544-824ae1b70434?w=200&h=200',
        ];

        // Cliente 3 - Free
        $usuarios[] = [
            'id_CorreoUsuario' => 'cliente3@skillbay.com',
            'nombre' => 'Pedro',
            'apellido' => 'Gomez',
            'genero' => 'Masculino',
            'telefono' => '+573000000004',
            'ciudad' => 'Barranquilla',
            'departamento' => 'Atlantico',
            'fechaNacimiento' => '1995-07-14',
            'password' => Hash::make('password123'),
            'rol' => 'cliente',
            'bloqueado' => false,
            'id_Plan' => 'Free',
            'imagen_perfil' => 'https://images.unsplash.com/photo-1500648767791-00dcc4aac36f?w=200&h=200&fit=crop',
        ];

        // Cliente 4 - Plus (bloqueado)
        $usuarios[] = [
            'id_CorreoUsuario' => 'cliente4@skillbay.com',
            'nombre' => 'Laura',
            'apellido' => 'Fernandez',
            'genero' => 'Femenino',
            'telefono' => '+573000000005',
            'ciudad' => 'Cartagena',
            'departamento' => 'Bolivar',
            'fechaNacimiento' => '1992-01-30',
            'password' => Hash::make('password123'),
            'rol' => 'cliente',
            'bloqueado' => true,
            'id_Plan' => 'Plus',
        ];

        // Cliente 5 - Enterprise
        $usuarios[] = [
            'id_CorreoUsuario' => 'cliente5@skillbay.com',
            'nombre' => 'Roberto',
            'apellido' => 'Sanchez',
            'genero' => 'Masculino',
            'telefono' => '+573000000006',
            'ciudad' => 'Bogota',
            'departamento' => 'Cundinamarca',
            'fechaNacimiento' => '1978-09-12',
            'password' => Hash::make('password123'),
            'rol' => 'cliente',
            'bloqueado' => false,
            'id_Plan' => 'Enterprise',
            'imagen_perfil' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
            'nequi_numero' => '3210000003',
            'nequi_nombre' => 'Roberto Sanchez',
        ];

        // ========== OFERTANTES ==========
        // Ofertante 1 - Ultra
        $usuarios[] = [
            'id_CorreoUsuario' => 'ofertante@skillbay.com',
            'nombre' => 'Maria',
            'apellido' => 'Lopez',
            'genero' => 'Femenino',
            'telefono' => '+573000000007',
            'ciudad' => 'Cali',
            'departamento' => 'Valle del Cauca',
            'fechaNacimiento' => '1993-05-18',
            'password' => Hash::make('password123'),
            'rol' => 'ofertante',
            'bloqueado' => false,
            'id_Plan' => 'Ultra',
            'imagen_perfil' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
            'nequi_numero' => '3210000004',
            'nequi_nombre' => 'Maria Lopez',
        ];

        // Ofertante 2 - Plus
        $usuarios[] = [
            'id_CorreoUsuario' => 'ofertante2@skillbay.com',
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'genero' => 'Masculino',
            'telefono' => '+573000000008',
            'ciudad' => 'Medellin',
            'departamento' => 'Antioquia',
            'fechaNacimiento' => '1991-08-25',
            'password' => Hash::make('password123'),
            'rol' => 'ofertante',
            'bloqueado' => false,
            'id_Plan' => 'Plus',
            'imagen_perfil' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
            'nequi_numero' => '3210000005',
            'nequi_nombre' => 'Juan Perez',
        ];

        // Ofertante 3 - Free
        $usuarios[] = [
            'id_CorreoUsuario' => 'ofertante3@skillbay.com',
            'nombre' => 'Sofia',
            'apellido' => 'Torres',
            'genero' => 'Femenino',
            'telefono' => '+573000000009',
            'ciudad' => 'Bogota',
            'departamento' => 'Cundinamarca',
            'fechaNacimiento' => '1998-12-03',
            'password' => Hash::make('password123'),
            'rol' => 'ofertante',
            'bloqueado' => false,
            'id_Plan' => 'Free',
            'imagen_perfil' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        ];

        // Ofertante 4 - Plus (bloqueado)
        $usuarios[] = [
            'id_CorreoUsuario' => 'ofertante4@skillbay.com',
            'nombre' => 'Miguel',
            'apellido' => 'Ruiz',
            'genero' => 'Masculino',
            'telefono' => '+573000000010',
            'ciudad' => 'Pereira',
            'departamento' => 'Risaralda',
            'fechaNacimiento' => '1987-04-19',
            'password' => Hash::make('password123'),
            'rol' => 'ofertante',
            'bloqueado' => true,
            'id_Plan' => 'Plus',
        ];

        // Ofertante 5 - Enterprise
        $usuarios[] = [
            'id_CorreoUsuario' => 'ofertante5@skillbay.com',
            'nombre' => 'Elena',
            'apellido' => 'Castillo',
            'genero' => 'Femenino',
            'telefono' => '+573000000011',
            'ciudad' => 'Bucaramanga',
            'departamento' => 'Santander',
            'fechaNacimiento' => '1985-10-07',
            'password' => Hash::make('password123'),
            'rol' => 'ofertante',
            'bloqueado' => false,
            'id_Plan' => 'Enterprise',
            'imagen_perfil' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
            'nequi_numero' => '3210000006',
            'nequi_nombre' => 'Elena Castillo',
            'bancolombia_qr' => 'https://images.unsplash.com/photo-1563013544-824ae1b70434?w=200&h=200',
        ];

        // ========== USUARIOS RANDOM (12-35) ==========
        $nombresH = ['Andres', 'Daniel', 'Fernando', 'Gabriel', 'Diego', 'Sebastian', 'Alejandro', 'Nicolas', 'David', 'Javier'];
        $nombresM = ['Camila', 'Isabella', 'Valentina', 'Mariana', 'Laura', 'Natalia', 'Paula', 'Daniela', 'Andrea', 'Carolina'];
        $apellidos = ['Garcia', 'Morales', 'Ortiz', 'Jimenez', 'Castro', 'Vargas', 'Ramirez', 'Herrera', 'Medina', 'Aguilar'];
        $ciudades = ['Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena', 'Cucuta', 'Ibague', 'Manizales', 'Pereira', 'Bucaramanga'];
        $departamentos = ['Cundinamarca', 'Antioquia', 'Valle del Cauca', 'Atlantico', 'Bolivar', 'Norte de Santander', 'Tolima', 'Caldas', 'Risaralda', 'Santander'];

        for ($i = 12; $i <= 35; $i++) {
            $esHombre = rand(0, 1) === 1;
            $nombre = $esHombre ? $nombresH[array_rand($nombresH)] : $nombresM[array_rand($nombresM)];
            $apellido = $apellidos[array_rand($apellidos)];
            $rol = rand(0, 1) === 1 ? 'cliente' : 'ofertante';
            $planOptions = ['Free', 'Free', 'Free', 'Plus', 'Ultra'];
            $plan = $planOptions[array_rand($planOptions)];
            
            $usuarios[] = [
                'id_CorreoUsuario' => "usuario{$i}@skillbay.com",
                'nombre' => $nombre,
                'apellido' => $apellido,
                'genero' => $esHombre ? 'Masculino' : 'Femenino',
                'telefono' => '+573000' . str_pad($i * 111111, 7, '0', STR_PAD_LEFT),
                'ciudad' => $ciudades[array_rand($ciudades)],
                'departamento' => $departamentos[array_rand($departamentos)],
                'fechaNacimiento' => date('Y-m-d', rand(strtotime('1980-01-01'), strtotime('2000-12-31'))),
                'password' => Hash::make('password123'),
                'rol' => $rol,
                'bloqueado' => false,
                'id_Plan' => $plan,
                'imagen_perfil' => $i % 2 === 0 
                    ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                    : null,
            ];
        }

        // Insertar todos los usuarios
        foreach ($usuarios as $usuario) {
            Usuario::updateOrCreate(
                ['id_CorreoUsuario' => $usuario['id_CorreoUsuario']],
                $usuario
            );
        }
    }
}