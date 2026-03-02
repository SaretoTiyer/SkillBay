<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\Postulacion;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ServicioController extends Controller
{
    // Explorar servicios publicados para visitantes (sin autenticacion)
    public function publicExplore()
    {
        $servicios = Servicio::with(['categoria', 'cliente_usuario'])
            ->where('estado', 'Activo')
            ->orderBy('fechaPublicacion', 'desc')
            ->get();

        $servicios->transform(function ($servicio) {
            if ($servicio->imagen) {
                $servicio->imagen = asset('storage/' . $servicio->imagen);
            }
            return $servicio;
        });

        return response()->json($servicios);
    }

    // Listar servicios del usuario autenticado
    public function index(Request $request)
    {
        $user = $request->user();
        $tipo = $request->query('tipo'); // filtrar por tipo: 'servicio' o 'oportunidad'

        $query = Servicio::where('id_Cliente', $user->id_CorreoUsuario)
            ->with('categoria')
            ->orderBy('fechaPublicacion', 'desc');

        // Filtrar por tipo si se especifica
        if ($tipo) {
            $query->where('tipo', $tipo);
        }

        $servicios = $query->get();

        // Transformar respuesta para incluir URL completa de la imagen
        $servicios->transform(function ($servicio) {
            if ($servicio->imagen) {
                $servicio->imagen = asset('storage/' . $servicio->imagen);
            }
            return $servicio;
        });

        return response()->json([
            'servicios' => $servicios,
            'total' => $servicios->count()
        ]);
    }

    // Explorar servicios publicados por otros usuarios
    public function explore(Request $request)
    {
        $user = $request->user();
        $tipo = $request->query('tipo'); // filtrar por tipo: 'servicio' o 'oportunidad'

        // Obtener IDs de servicios/oportunidades donde el usuario ya tiene postulación activa
        // Solo excluimos postulaciones pendientes o aceptadas - las rechazadas pueden reaplicar
        $postulacionesActivas = Postulacion::where('id_Usuario', $user->id_CorreoUsuario)
            ->whereIn('estado', ['pendiente', 'aceptada'])
            ->pluck('id_Servicio')
            ->toArray();

        $query = Servicio::with(['categoria', 'cliente_usuario'])
            ->where('estado', 'Activo')
            ->where('id_Cliente', '!=', $user->id_CorreoUsuario);

        // Excluir servicios donde el usuario ya tiene postulación activa
        if (!empty($postulacionesActivas)) {
            $query->whereNotIn('id_Servicio', $postulacionesActivas);
        }

        // Filtrar por tipo si se especifica
        if ($tipo) {
            $query->where('tipo', $tipo);
        }

        $servicios = $query->orderBy('fechaPublicacion', 'desc')->get();

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
        $user = $request->user();
        if ($user->bloqueado) {
            return response()->json(['message' => 'Tu cuenta esta bloqueada.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'precion' => 'nullable|numeric', // Frontend might send 'precion' or 'precio'
            'precio' => 'nullable|numeric',
            'tiempo_entrega' => 'nullable|string|max:191',
            'id_Categoria' => 'required|exists:categorias,id_Categoria',
            'imagen' => 'nullable|image|max:2048', // 2MB Max
            'estado' => 'nullable|string|in:Activo,Borrador,Inactivo',
            'tipo' => 'nullable|string|in:servicio,oportunidad',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->loadMissing('plan');
        if ($user->plan && $user->plan->limiteServiciosMes !== null) {
            $serviciosMes = Servicio::where('id_Cliente', $user->id_CorreoUsuario)
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count();

            if ($serviciosMes >= (int) $user->plan->limiteServiciosMes) {
                return response()->json([
                    'message' => 'Has alcanzado el limite mensual de servicios de tu plan actual.',
                ], 403);
            }
        }

        $data = $request->all();
        $data['id_Cliente'] = $user->id_CorreoUsuario;
        $data['estado'] = $data['estado'] ?? 'Activo';
        
        // Determinar el tipo según el rol del usuario:
        // - Clientes crean oportunidades (necesitan servicios)
        // - Ofertantes crean servicios (ofrecen servicios)
        if (!isset($data['tipo'])) {
            if ($user->rol === 'cliente') {
                $data['tipo'] = 'oportunidad';
            } else {
                $data['tipo'] = 'servicio';
            }
        }

        // Lógica de transición de roles:
        // - Si el usuario es 'cliente' y crea un 'servicio', debe convertirse en 'ofertante'
        // - Un cliente que crea oportunidades sigue siendo cliente
        if ($user->rol === 'cliente' && isset($data['tipo']) && $data['tipo'] === 'servicio') {
            $user->rol = 'ofertante';
            $user->save();
        }

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

        if ($user->rol === 'ofertante') {
            $tienePostulaciones = Postulacion::where('id_Usuario', $user->id_CorreoUsuario)
                ->whereIn('estado', ['pendiente', 'aceptada', 'rechazada'])
                ->exists();
            if (!$tienePostulaciones) {
                $user->rol = 'cliente';
                $user->save();
            }
        }

        if ($servicio->imagen) {
            $servicio->imagen = asset('storage/' . $servicio->imagen);
        }

        Notificacion::create([
            'mensaje' => 'Tu servicio "' . $servicio->titulo . '" fue publicado.',
            'estado' => 'No leido',
            'tipo' => 'servicio',
            'id_CorreoUsuario' => $user->id_CorreoUsuario,
        ]);

        return response()->json($servicio, 201);
    }

    // Actualizar servicio
    public function update(Request $request, $id)
    {
        $user = $request->user();
        if ($user->bloqueado) {
            return response()->json(['message' => 'Tu cuenta esta bloqueada.'], 403);
        }
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
        if ($user->bloqueado) {
            return response()->json(['message' => 'Tu cuenta esta bloqueada.'], 403);
        }
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
