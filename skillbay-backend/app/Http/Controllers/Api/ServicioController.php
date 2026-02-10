<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ServicioController extends Controller
{
    // Listar servicios del usuario autenticado
    public function index(Request $request)
    {
        $user = $request->user();
        $servicios = Servicio::where('id_Cliente', $user->id_CorreoUsuario)
            ->with('categoria')
            ->orderBy('fechaPublicacion', 'desc')
            ->get();

        // Transformar respuesta para incluir URL completa de la imagen
        $servicios->transform(function ($servicio) {
            if ($servicio->imagen) {
                $servicio->imagen = asset('storage/' . $servicio->imagen);
            }
            return $servicio;
        });

        return response()->json($servicios);
    }

    // Crear un nuevo servicio
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'precion' => 'nullable|numeric', // Frontend might send 'precion' or 'precio'
            'precio' => 'nullable|numeric',
            'tiempo_entrega' => 'nullable|string|max:191',
            'id_Categoria' => 'required|exists:categorias,id_Categoria',
            'imagen' => 'nullable|image|max:2048', // 2MB Max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $data = $request->all();
        $data['id_Cliente'] = $user->id_CorreoUsuario;
        $data['estado'] = 'Activo'; // Default

        // Handle Image Upload
        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('servicios', 'public');
            $data['imagen'] = $path;
        }

        // Fix potential field name mismatch
        if (isset($data['precion']) && !isset($data['precio'])) {
            $data['precio'] = $data['precion'];
        }

        $servicio = Servicio::create($data);

        if ($servicio->imagen) {
            $servicio->imagen = asset('storage/' . $servicio->imagen);
        }

        return response()->json($servicio, 201);
    }

    // Actualizar servicio
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $servicio = Servicio::where('id_Servicio', $id)
            ->where('id_Cliente', $user->id_CorreoUsuario)
            ->first();

        if (!$servicio) {
            return response()->json(['message' => 'Servicio no encontrado o no autorizado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'precio' => 'nullable|numeric',
            'tiempo_entrega' => 'nullable|string|max:191',
            'id_Categoria' => 'required|exists:categorias,id_Categoria',
            'imagen' => 'nullable|image|max:2048',
            'estado' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        // Handle Image Upload
        if ($request->hasFile('imagen')) {
            // Delete old image
            if ($servicio->imagen) {
                Storage::disk('public')->delete($servicio->imagen);
            }
            $path = $request->file('imagen')->store('servicios', 'public');
            $data['imagen'] = $path;
        }

        $servicio->update($data);

        if ($servicio->imagen) {
            $servicio->imagen = asset('storage/' . $servicio->imagen);
        }

        return response()->json($servicio);
    }

    // Eliminar servicio
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $servicio = Servicio::where('id_Servicio', $id)
            ->where('id_Cliente', $user->id_CorreoUsuario)
            ->first();

        if (!$servicio) {
            return response()->json(['message' => 'Servicio no encontrado o no autorizado'], 404);
        }

        if ($servicio->imagen) {
            Storage::disk('public')->delete($servicio->imagen);
        }

        $servicio->delete();

        return response()->json(['message' => 'Servicio eliminado correctamente']);
    }
}
