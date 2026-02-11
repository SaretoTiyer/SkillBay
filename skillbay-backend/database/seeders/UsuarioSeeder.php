<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        Usuario::create([
            'id_CorreoUsuario' => 'admin@skillbay.com',
            'nombre' => 'Admin',
            'apellido' => 'User',
            'genero' => 'Otro',
            'telefono' => '3000000001',
            'ciudad' => 'Bogotá',
            'departamento' => 'Cundinamarca',
            'password' => Hash::make('password123'),
            'rol' => 'admin',
            'fechaRegistro' => now(),
        ]);

        // Cliente
        Usuario::create([
            'id_CorreoUsuario' => 'cliente@skillbay.com',
            'nombre' => 'Cliente',
            'apellido' => 'Test',
            'genero' => 'Masculino',
            'telefono' => '3000000002',
            'ciudad' => 'Medellín',
            'departamento' => 'Antioquia',
            'password' => Hash::make('password123'),
            'rol' => 'cliente',
            'fechaRegistro' => now(),
        ]);

        // Ofertante
        Usuario::create([
            'id_CorreoUsuario' => 'ofertante@skillbay.com',
            'nombre' => 'Ofertante',
            'apellido' => 'Pro',
            'genero' => 'Femenino',
            'telefono' => '3000000003',
            'ciudad' => 'Cali',
            'departamento' => 'Valle del Cauca',
            'password' => Hash::make('password123'),
            'rol' => 'ofertante',
            'fechaRegistro' => now(),
        ]);

        // Generate 20+ random users
        $faker = \Faker\Factory::create('es_CO');
        
        for ($i = 0; $i < 25; $i++) {
            Usuario::create([
                'id_CorreoUsuario' => $faker->unique()->email,
                'nombre' => $faker->firstName,
                'apellido' => $faker->lastName,
                'genero' => $faker->randomElement(['Masculino', 'Femenino', 'Otro']),
                'telefono' => $faker->unique()->numerify('3#########'),
                'ciudad' => $faker->city,
                'departamento' => $faker->state,
                'password' => Hash::make('password123'),
                'rol' => $faker->randomElement(['cliente', 'ofertante']),
                'fechaRegistro' => $faker->dateTimeBetween('-1 year', 'now'),
            ]);
        }
    }
}
