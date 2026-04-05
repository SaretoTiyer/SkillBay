<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
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
            if (! $this->validarAdmin($request)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'id_Categoria' => 'nullable|string|max:191|unique:categorias,id_Categoria',
                'nombre' => 'required|string|min:2|max:100',
                'grupo' => 'nullable|string|max:120',
                'descripcion' => 'nullable|string|max:2000',
                'imagen' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();
            $idCategoria = $data['id_Categoria'] ?? Str::slug($data['nombre'], '_');

            if (Categoria::where('id_Categoria', $idCategoria)->exists()) {
                $idCategoria = $idCategoria.'_'.time();
            }

            $categoria = Categoria::create([
                'id_Categoria' => $idCategoria,
                'nombre' => $data['nombre'],
                'grupo' => $data['grupo'] ?? null,
                'descripcion' => $data['descripcion'] ?? null,
                'imagen' => $data['imagen'] ?? null,
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
            $categorias = Categoria::orderBy('grupo')->orderBy('nombre')->get();

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
            if (! $this->validarAdmin($request)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $categoria = Categoria::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|min:2|max:100',
                'grupo' => 'nullable|string|max:120',
                'descripcion' => 'nullable|string|max:2000',
                'imagen' => 'nullable|string|max:500',
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
     * KPIs de categorias para el dashboard admin.
     */
    public function kpis(Request $request)
    {
        try {
            if (! $this->validarAdmin($request)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $categorias = Categoria::withCount('servicios')->get();

            $total = $categorias->count();
            $conImagen = $categorias->whereNotNull('imagen')->count();
            $sinImagen = $total - $conImagen;

            // Agregar por grupo
            $porGrupo = $categorias
                ->groupBy('grupo')
                ->map(fn ($items, $grupo) => [
                    'grupo' => $grupo ?: 'Sin grupo',
                    'total_categorias' => $items->count(),
                    'total_servicios' => $items->sum('servicios_count'),
                ])
                ->values();

            // Top categorias por cantidad de servicios
            $topPorServicios = $categorias
                ->sortByDesc('servicios_count')
                ->take(10)
                ->map(fn ($c) => [
                    'id_Categoria' => $c->id_Categoria,
                    'nombre' => $c->nombre,
                    'grupo' => $c->grupo,
                    'servicios_count' => $c->servicios_count,
                ])
                ->values();

            return response()->json([
                'success' => true,
                'kpis' => [
                    'total' => $total,
                    'con_imagen' => $conImagen,
                    'sin_imagen' => $sinImagen,
                    'grupos' => $categorias->pluck('grupo')->filter()->unique()->count(),
                    'por_grupo' => $porGrupo,
                    'top_por_servicios' => $topPorServicios,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los KPIs',
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
            if (! $this->validarAdmin($request)) {
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
