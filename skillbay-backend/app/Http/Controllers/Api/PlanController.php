<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PlanController extends Controller
{
    private function validarAdmin(Request $request)
    {
        $user = $request->user();
        return $user && $user->rol === 'admin';
    }

    /**
     * Crear plan (solo admin).
     */
    public function crear(Request $request)
    {
        try {
            if (!$this->validarAdmin($request)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'id_Plan' => 'required|string|in:Free,Plus,Ultra|unique:planes,id_Plan',
                'nombre' => 'required|string|min:2|max:100',
                'beneficios' => 'nullable|string|max:2000',
                'precioMensual' => 'required|numeric|min:0',
                'limiteServiciosMes' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $plan = Plan::create($validator->validated());

            return response()->json([
                'success' => true,
                'plan' => $plan,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validacion',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar todos los planes.
     */
    public function listar()
    {
        try {
            $planes = Plan::orderByRaw("FIELD(id_Plan, 'Free', 'Plus', 'Ultra')")->get();

            return response()->json([
                'success' => true,
                'total' => $planes->count(),
                'planes' => $planes,
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
     * Ver un plan.
     */
    public function ver($id)
    {
        try {
            $plan = Plan::findOrFail($id);

            return response()->json([
                'success' => true,
                'plan' => $plan,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Actualizar un plan (solo admin).
     */
    public function actualizar(Request $request, $id)
    {
        try {
            if (!$this->validarAdmin($request)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $plan = Plan::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|min:2|max:100',
                'beneficios' => 'nullable|string|max:2000',
                'precioMensual' => 'sometimes|required|numeric|min:0',
                'limiteServiciosMes' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $plan->update($validator->validated());

            return response()->json([
                'success' => true,
                'plan' => $plan,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validacion',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar un plan (solo admin).
     */
    public function eliminar($id)
    {
        try {
            if (!request()->user() || request()->user()->rol !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $plan = Plan::findOrFail($id);
            $plan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Plan eliminado correctamente',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
