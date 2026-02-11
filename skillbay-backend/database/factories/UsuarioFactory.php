<?php

namespace Database\Factories;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Usuario>
 */
class UsuarioFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Usuario::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_CorreoUsuario' => fake()->unique()->safeEmail(),
            'nombre' => fake()->firstName(),
            'apellido' => fake()->lastName(),
            'genero' => fake()->randomElement(['Masculino', 'Femenino', 'Otro']),
            'telefono' => fake()->unique()->phoneNumber(),
            'ciudad' => fake()->city(),
            'departamento' => fake()->state(),
            'password' => Hash::make('password'),
            'rol' => 'usuario',
            'fechaRegistro' => now()->toDateString(),
        ];
    }
}
