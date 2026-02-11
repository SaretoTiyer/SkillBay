<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class CategoriaController extends Controller
{
    /**
     * Crear categoría --> esta funcionalidad es solo para el admin
     */
    public function crear(request $request){
        try{
            // Validar los datos
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|min:2|max:100|regex:/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/',
                'descripcion' => 'required|string|min:2|max:100|regex:/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/',
            ], [
                'nombre.required' => 'El nombre es obligatorio.',
                'nombre.min' => 'El nombre debe tener al menos 2 caracteres.',
                'nombre.max' => 'El nombre debe tener menos de 100 caracteres.',
                'nombre.regex' => 'El nombre no puede contener caracteres especiales.',
                'descripcion.required' => 'La descripcion es obligatoria.',
                'descripcion.min' => 'La descripcion debe tener al menos 2 caracteres.',
                'descripcion.max' => 'La descripcion debe tener menos de 100 caracteres.',
                'descripcion.regex' => 'La descripcion no puede contener caracteres especiales.',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            // Crear la categoría
            $categoria = new Categoria();
            $categoria->nombre = $data['nombre'];
            $categoria->save();

            return response()->json([
                'success' => true,
                'categoria' => $categoria
            ], 201);
        }
        catch(\Exception $e){
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la categoría',
                'error' => $e->getMessage(),
            ], 500);
        } 
    }

    /**
     * Listar todas las categorías
     */
    public function listar(){
        try {
            $categorias = Categoria::all();
            return response()->json([
                'success' => true,
                'total' => $categorias->count(),
                'categorias' => $categorias
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las categorias',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ver una categoría
     */
    public function ver($id){
        try {
            $categoria = Categoria::findOrFail($id);
            return response()->json([
                'success' => true,
                'categoria' => $categoria
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la categoria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Editar una categoría --> esta funcionalidad es solo para el admin
     */
    public function actualizar(request $request, $id){
        try {
            $categoria = Categoria::findOrFail($id);
            $categoria->update($request->all());
            return response()->json([
                'success' => true,
                'categoria' => $categoria
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la categoria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar una categoría --> esta funcionalidad es solo para el admin
     */
    public function eliminar($id){
        try {
            $categoria = Categoria::findOrFail($id);
            $categoria->delete();
            return response()->json([
                'success' => true,
                'message' => 'Categoria eliminada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la categoria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}