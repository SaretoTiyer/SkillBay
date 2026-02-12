<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CategoriaController extends Controller
{
    private function validarAdmin(Request $request)
    {
        $user = $request->user();
        return $user && $user->rol === 'admin';
    }

    /**
     * Crear categoria (solo admin).
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
                'id_Categoria' => 'nullable|string|max:191|unique:categorias,id_Categoria',
                'nombre' => 'required|string|min:2|max:100',
                'descripcion' => 'nullable|string|max:2000',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();
            $idCategoria = $data['id_Categoria'] ?? Str::slug($data['nombre'], '_');

            if (Categoria::where('id_Categoria', $idCategoria)->exists()) {
                $idCategoria = $idCategoria . '_' . time();
            }

            $categoria = Categoria::create([
                'id_Categoria' => $idCategoria,
                'nombre' => $data['nombre'],
                'descripcion' => $data['descripcion'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'categoria' => $categoria,
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
                'message' => 'Error al crear la categoria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar categorias.
     */
    public function listar()
    {
        try {
            $categorias = Categoria::orderBy('nombre')->get();
            return response()->json([
                'success' => true,
                'total' => $categorias->count(),
                'categorias' => $categorias,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las categorias',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ver una categoria.
     */
    public function ver($id)
    {
        try {
            $categoria = Categoria::findOrFail($id);
            return response()->json([
                'success' => true,
                'categoria' => $categoria,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la categoria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Actualizar categoria (solo admin).
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

            $categoria = Categoria::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|min:2|max:100',
                'descripcion' => 'nullable|string|max:2000',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $categoria->update($validator->validated());

            return response()->json([
                'success' => true,
                'categoria' => $categoria,
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
                'message' => 'Error al actualizar la categoria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar categoria (solo admin).
     */
    public function eliminar(Request $request, $id)
    {
        try {
            if (!$this->validarAdmin($request)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $categoria = Categoria::findOrFail($id);
            $categoria->delete();

            return response()->json([
                'success' => true,
                'message' => 'Categoria eliminada correctamente',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la categoria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
