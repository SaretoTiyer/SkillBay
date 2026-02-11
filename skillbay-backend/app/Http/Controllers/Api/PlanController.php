<?php 

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plan;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class PlanController extends Controller {

    /**
     * Crear plan --> esta funcionalidad es solo para el admin
     */
    public function crear (request $request) {
        try{
            // Validar los datos
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|min:2|max:100|regex:/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/',
                'descripcion' => 'required|string|min:2|max:100|regex:/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/',
                'precio' => 'required|numeric',
            ], [
                'nombre.required' => 'El nombre es obligatorio.',
                'nombre.min' => 'El nombre debe tener al menos 2 caracteres.',
                'nombre.max' => 'El nombre debe tener menos de 100 caracteres.',
                'nombre.regex' => 'El nombre no puede contener caracteres especiales.',
                'descripcion.required' => 'La descripcion es obligatoria.',
                'descripcion.min' => 'La descripcion debe tener al menos 2 caracteres.',
                'descripcion.max' => 'La descripcion debe tener menos de 100 caracteres.',
                'descripcion.regex' => 'La descripcion no puede contener caracteres especiales.',
                'precio.required' => 'El precio es obligatorio.',
                'precio.numeric' => 'El precio debe ser un numero.',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            // Crear el plan
            $plan = Plan::create([
                'nombre' => $data['nombre'],
                'descripcion' => $data['descripcion'],
                'precio' => $data['precio'],
            ]);

            return response()->json([
                'success' => true,
                'plan' => [
                    'id' => $plan->id,
                    'nombre' => $plan->nombre,
                    'descripcion' => $plan->descripcion,
                    'precio' => $plan->precio
            ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el plan',
                'error' => $e->getMessage(),
            ], 500);
        }

    }

    /**
     * Listar todos los planes
     */
    public function listar() {
        try {
            $planes = Plan::all();
            return response()->json([
                'success' => true,
                'total' => $planes->count(),
                'planes' => $planes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los planes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ver un plan
     */
    public function ver($id) {
        try {
            $plan = Plan::findOrFail($id);
            return response()->json([
                'success' => true,
                'plan' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Actualizar un plan --> esta funcionalidad es solo para el admin
     */
    public function actualizar (request $request, $id) {
        try {
            $plan = Plan::findOrFail($id);
            $plan->update($request->all());
            return response()->json([
                'success' => true,
                'plan' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar un plan --> esta funcionalidad es solo para el admin
     */
    public function eliminar ($id) {
        try {
            $plan = Plan::findOrFail($id);
            $plan->delete();
            return response()->json([
                'success' => true,
                'message' => 'Plan eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}