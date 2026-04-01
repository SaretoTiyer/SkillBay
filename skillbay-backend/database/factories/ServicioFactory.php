<?php

namespace Database\Factories;

use App\Models\Servicio;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServicioFactory extends Factory
{
    protected $model = Servicio::class;

    public function definition(): array
    {
        return [
            'titulo' => fake()->sentence(3),
            'descripcion' => fake()->paragraph(),
            'precio' => fake()->numberBetween(50000, 500000),
            'id_Dueno' => Usuario::factory(),
            'id_Categoria' => 'tec_desarrollo_web',
            'tipo' => fake()->randomElement(['servicio', 'oportunidad']),
            'estado' => 'activo',
            'ciudad' => fake()->city(),
            'departamento' => fake()->state(),
        ];
    }
}
