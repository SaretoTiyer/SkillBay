<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BienvenidaMail;
use App\Models\Notificacion;
use App\Models\Plan;
use App\Models\Resena;
use App\Models\Servicio;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UsuarioController extends Controller
{
    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request)
    {
        try {
            // Validación reforzada
            $validator = Validator::make($request->all(), [
                'id_CorreoUsuario' => [
                    'required',
                    'email',
                    'max:191',
                    'unique:usuarios,id_CorreoUsuario',
                    'regex:/^\S+$/', // sin espacios
                ],
                'nombre' => 'required|string|min:2|max:100|regex:/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/',
                'apellido' => 'required|string|min:2|max:100|regex:/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/',
                'genero' => 'nullable|string|in:Masculino,Femenino,Otro',
                'telefono' => 'required|string|min:7|max:20|regex:/^[0-9+\-\s]+$/|unique:usuarios,telefono',
                'ciudad' => 'nullable|string|max:100',
                'departamento' => 'nullable|string|max:100',
                'fechaNacimiento' => 'required|date|before_or_equal:'.now()->subYears(18)->format('Y-m-d'),
                'password' => [
                    'required',
                    'string',
                    'min:6',
                    'max:100',
                    'regex:/^\S+$/', // sin espacios
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,15}$/', // Mínimo 8, máximo 15, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
                ],
                'rol' => 'nullable|string|in:cliente,ofertante,admin',
                'id_Plan' => 'nullable|string|exists:planes,id_Plan',
            ], [
                'id_CorreoUsuario.required' => 'El correo electrónico es obligatorio.',
                'id_CorreoUsuario.email' => 'Debe ser un correo válido.',
                'id_CorreoUsuario.unique' => 'Este correo ya está registrado.',
                'id_CorreoUsuario.regex' => 'El correo no puede contener espacios.',
                'nombre.required' => 'El nombre es obligatorio.',
                'nombre.regex' => 'El nombre solo puede contener letras y espacios.',
                'apellido.required' => 'El apellido es obligatorio.',
                'apellido.regex' => 'El apellido solo puede contener letras y espacios.',
                'telefono.required' => 'El teléfono es obligatorio.',
                'telefono.unique' => 'Este número de teléfono ya está registrado.',
                'telefono.regex' => 'El teléfono solo puede contener números, espacios, guiones o el símbolo +.',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
                'password.regex' => 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial, y no puede contener espacios.',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            $planDefault = 'Free';
            if (! Plan::where('id_Plan', $planDefault)->exists()) {
                $planDefault = null;
            }

            $user = Usuario::create([
                'id_CorreoUsuario' => strtolower(trim($data['id_CorreoUsuario'])),
                'nombre' => strip_tags(trim($data['nombre'])),
                'apellido' => strip_tags(trim($data['apellido'])),
                'genero' => $data['genero'] ?? null,
                'telefono' => strip_tags(trim($data['telefono'])),
                'ciudad' => strip_tags(trim($data['ciudad'] ?? '')),
                'departamento' => strip_tags(trim($data['departamento'] ?? '')),
                'fechaNacimiento' => Carbon::parse($data['fechaNacimiento'])->format('Y-m-d'),
                'password' => Hash::make($data['password']),
                'rol' => $data['rol'] ?? 'cliente',
                'id_Plan' => $data['id_Plan'] ?? $planDefault,
                'bloqueado' => false,
                'fechaRegistro' => now(),
            ]);

            Notificacion::create([
                'mensaje' => 'Bienvenido a SkillBay. Tu cuenta esta lista para comenzar.',
                'estado' => 'No leido',
                'tipo' => 'sistema',
                'id_CorreoUsuario' => $user->id_CorreoUsuario,
            ]);

            // Enviar email de bienvenida de forma asíncrona
            Mail::to($user->id_CorreoUsuario)->queue(new BienvenidaMail($user));

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'usuario' => $user,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Iniciar sesión
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_CorreoUsuario' => ['required', 'email', 'regex:/^\S+$/'],
                'password' => ['required', 'string', 'min:6', 'regex:/^\S+$/'],
            ], [
                'id_CorreoUsuario.required' => 'El correo es obligatorio.',
                'id_CorreoUsuario.email' => 'Debe ser un correo válido.',
                'id_CorreoUsuario.regex' => 'El correo no puede contener espacios.',
                'password.required' => 'La contraseña es obligatoria.',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
                'password.regex' => 'La contraseña no puede contener espacios.',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();
            $usuario = Usuario::where('id_CorreoUsuario', $data['id_CorreoUsuario'])->first();

            if (! $usuario || ! Hash::check($data['password'], $usuario->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales incorrectas.',
                ], 401);
            }

            if ($usuario->bloqueado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta fue bloqueada por administracion.',
                ], 403);
            }

            $hasWelcome = Notificacion::where('id_CorreoUsuario', $usuario->id_CorreoUsuario)
                ->where('tipo', 'sistema')
                ->where('mensaje', 'like', 'Bienvenido a SkillBay%')
                ->exists();
            if (! $hasWelcome) {
                Notificacion::create([
                    'mensaje' => 'Bienvenido a SkillBay. Tu cuenta esta lista para comenzar.',
                    'estado' => 'No leido',
                    'tipo' => 'sistema',
                    'id_CorreoUsuario' => $usuario->id_CorreoUsuario,
                ]);
            }

            // Crear token
            $token = $usuario->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso.',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'usuario' => $usuario,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'usuario' => $request->user(),
        ]);
    }

    /**
     * Actualizar perfil de usuario
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->bloqueado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta esta bloqueada.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'nullable|string|min:2|max:100|regex:/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/',
                'apellido' => 'nullable|string|min:2|max:100|regex:/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/',
                'genero' => 'nullable|string|in:Masculino,Femenino,Otro',
                'telefono' => 'nullable|string|min:7|max:20|regex:/^[0-9+\-\s]+$/|unique:usuarios,telefono,'.$user->id_CorreoUsuario.',id_CorreoUsuario',
                'ciudad' => 'nullable|string|max:100',
                'departamento' => 'nullable|string|max:100',
                'fechaNacimiento' => 'nullable|date|before_or_equal:'.now()->subYears(18)->format('Y-m-d'),
                'id_Plan' => 'nullable|string|exists:planes,id_Plan',
                'password' => 'nullable|string|min:8|regex:/^\S+$/', // sin espacios
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            // Actualizar campos si vienen en la petición
            if (isset($data['nombre'])) {
                $user->nombre = strip_tags(trim($data['nombre']));
            }
            if (isset($data['apellido'])) {
                $user->apellido = strip_tags(trim($data['apellido']));
            }
            if (isset($data['genero'])) {
                $user->genero = $data['genero'];
            }
            if (isset($data['telefono'])) {
                $user->telefono = strip_tags(trim($data['telefono']));
            }
            if (isset($data['ciudad'])) {
                $user->ciudad = strip_tags(trim($data['ciudad']));
            }
            if (isset($data['departamento'])) {
                $user->departamento = strip_tags(trim($data['departamento']));
            }
            if (isset($data['fechaNacimiento'])) {
                $user->fechaNacimiento = Carbon::parse($data['fechaNacimiento'])->format('Y-m-d');
            }
            if (isset($data['id_Plan'])) {
                $user->id_Plan = $data['id_Plan'];
            }
            if (isset($data['password'])) {
                $user->password = Hash::make($data['password']);
            }

            // Guardar cambios - Importante: usar save() en el modelo Usuario
            // Asegúrate de que el modelo Usuario tenga definida la primaryKey correctamente si no es 'id'
            $user->save();

            if (isset($data['id_Plan'])) {
                Notificacion::create([
                    'mensaje' => 'Tu plan ahora es '.$data['id_Plan'].'.',
                    'estado' => 'No leido',
                    'tipo' => 'plan',
                    'id_CorreoUsuario' => $user->id_CorreoUsuario,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado correctamente',
                'usuario' => $user,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar perfil',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Subir imagen de perfil
     */
    public function uploadProfileImage(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->bloqueado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta esta bloqueada.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'imagen_perfil' => [
                    'required',
                    'image',
                    'mimes:jpeg,png,jpg,webp',
                    'max:2048',
                    'dimensions:min_width=50,min_height=50,max_width=2000,max_height=2000',
                ],
            ], [
                'imagen_perfil.mimes' => 'Solo se permiten imágenes JPEG, PNG o WebP.',
                'imagen_perfil.max' => 'La imagen no puede superar 2MB.',
                'imagen_perfil.dimensions' => 'La imagen debe tener entre 50×50 y 2000×2000 píxeles.',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            // Eliminar imagen anterior si existe
            if ($user->imagen_perfil) {
                Storage::disk('public')->delete($user->imagen_perfil);
            }

            // Guardar nueva imagen
            $path = $request->file('imagen_perfil')->store('perfiles', 'public');
            $user->imagen_perfil = $path;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Imagen de perfil actualizada',
                'path' => $path,
                'imagen_perfil' => asset('storage/'.$path),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir la imagen',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar todos los usuarios
     */
    public function listarAdmin(Request $request)
    {
        try {

            $usuarios = Usuario::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'total' => $usuarios->count(),
                'usuarios' => $usuarios,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los usuarios',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bloquear o desbloquear usuario (solo admin).
     */
    public function cambiarBloqueo(Request $request, $id)
    {
        try {

            $validator = Validator::make($request->all(), [
                'bloqueado' => 'required|boolean',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $usuario = Usuario::findOrFail($id);
            $usuario->bloqueado = $validator->validated()['bloqueado'];
            $usuario->save();

            Notificacion::create([
                'mensaje' => $usuario->bloqueado
                    ? 'Tu cuenta ha sido bloqueada por administracion.'
                    : 'Tu cuenta ha sido desbloqueada por administracion.',
                'estado' => 'No leido',
                'tipo' => 'cuenta',
                'id_CorreoUsuario' => $usuario->id_CorreoUsuario,
            ]);

            return response()->json([
                'success' => true,
                'usuario' => $usuario,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validacion',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado del usuario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener perfil público de usuario
     */
    public function perfilPublico(Request $request, $id)
    {
        try {
            $viewer = $request->user();
            if (! $viewer) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 401);
            }

            $usuario = Usuario::select([
                'id_CorreoUsuario',
                'nombre',
                'apellido',
                'rol',
                'ciudad',
                'departamento',
                'id_Plan',
                'imagen_perfil',
                'fechaRegistro',
            ])->findOrFail($id);

            // Obtener servicios (tipo=servicio) del usuario
            $servicios = Servicio::where('id_Dueno', $usuario->id_CorreoUsuario)
                ->where('tipo', 'servicio')
                ->with('categoria:id_Categoria,nombre,grupo')
                ->orderBy('created_at', 'desc')
                ->get([
                    'id_Servicio',
                    'titulo',
                    'descripcion',
                    'precio',
                    'estado',
                    'imagen',
                    'id_Categoria',
                    'created_at',
                    'tipo',
                ])
                ->map(function ($s) {
                    if ($s->imagen) {
                        $s->imagen = str_starts_with($s->imagen, 'http')
                            ? $s->imagen
                            : asset('storage/'.$s->imagen);
                    }

                    return $s;
                });

            // Obtener oportunidades (tipo=oportunidad) del usuario
            $oportunidades = Servicio::where('id_Dueno', $usuario->id_CorreoUsuario)
                ->where('tipo', 'oportunidad')
                ->with('categoria:id_Categoria,nombre,grupo')
                ->orderBy('created_at', 'desc')
                ->get([
                    'id_Servicio',
                    'titulo',
                    'descripcion',
                    'precio',
                    'estado',
                    'imagen',
                    'id_Categoria',
                    'created_at',
                    'tipo',
                ])
                ->map(function ($s) {
                    if ($s->imagen) {
                        $s->imagen = str_starts_with($s->imagen, 'http')
                            ? $s->imagen
                            : asset('storage/'.$s->imagen);
                    }

                    return $s;
                });

            // Obtener reseñas recibidas como ofertante y como cliente
            $resenasRes = $this->obtenerResenasUsuario($usuario->id_CorreoUsuario);
            $resenasComoOfertante = $resenasRes['resenas_como_ofertante'];
            $resenasComoCliente = $resenasRes['resenas_como_cliente'];

            // Calcular promedios
            $promedioOfertante = $resenasRes['promedio_ofertante'];
            $promedioCliente = $resenasRes['promedio_cliente'];

            return response()->json([
                'success' => true,
                'usuario' => $usuario,
                'servicios' => $servicios,
                'oportunidades' => $oportunidades,
                'resenas_como_ofertante' => $resenasComoOfertante,
                'resenas_como_cliente' => $resenasComoCliente,
                'resumen' => [
                    'totalServicios' => $servicios->count() + $oportunidades->count(),
                    'serviciosActivos' => $servicios->where('estado', 'Activo')->count() + $oportunidades->where('estado', 'Activo')->count(),
                    'promedioOfertante' => $promedioOfertante,
                    'promedioCliente' => $promedioCliente,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo cargar el perfil.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar todos los usuarios
     */
    public function listar(Request $request)
    {
        try {
            $user = $request->user();
            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 401);
            }

            if ($user->rol !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $usuarios = Usuario::select([
                'id_CorreoUsuario', 'nombre', 'apellido', 'rol',
                'ciudad', 'departamento', 'id_Plan', 'bloqueado', 'fechaRegistro',
            ])->get();

            return response()->json([
                'success' => true,
                'total' => $usuarios->count(),
                'usuarios' => $usuarios,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los usuarios',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener configuración de métodos de pago del usuario
     */
    public function getMetodosPago(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'nequi_numero' => $user->nequi_numero,
                'nequi_nombre' => $user->nequi_nombre,
                'nequi_qr' => $user->nequi_qr,
                'bancolombia_qr' => $user->bancolombia_qr,
                'metodos_pago_activos' => $user->metodos_pago_activos ?? ['tarjeta', 'efectivo'],
            ],
        ]);
    }

    /**
     * Actualizar configuración de métodos de pago del usuario
     */
    public function updateMetodosPago(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->bloqueado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta está bloqueada.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'nequi_numero' => 'nullable|string|min:10|max:20|regex:/^[0-9]+$/',
                'nequi_nombre' => 'nullable|string|max:100',
                'nequi_qr' => 'nullable|string|max:500',
                'bancolombia_qr' => 'nullable|string|max:500',
                'metodos_pago_activos' => 'nullable|array',
                'metodos_pago_activos.*' => 'string|in:tarjeta,nequi,bancolombia_qr,efectivo',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            if (isset($data['nequi_numero'])) {
                $user->nequi_numero = strip_tags(trim($data['nequi_numero']));
            }
            if (isset($data['nequi_nombre'])) {
                $user->nequi_nombre = strip_tags(trim($data['nequi_nombre']));
            }
            if (isset($data['nequi_qr'])) {
                $user->nequi_qr = $data['nequi_qr'];
            }
            if (isset($data['bancolombia_qr'])) {
                $user->bancolombia_qr = $data['bancolombia_qr'];
            }
            if (isset($data['metodos_pago_activos'])) {
                $user->metodos_pago_activos = $data['metodos_pago_activos'];
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Métodos de pago actualizados correctamente',
                'data' => [
                    'nequi_numero' => $user->nequi_numero,
                    'nequi_nombre' => $user->nequi_nombre,
                    'nequi_qr' => $user->nequi_qr,
                    'bancolombia_qr' => $user->bancolombia_qr,
                    'metodos_pago_activos' => $user->metodos_pago_activos,
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar métodos de pago',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Subir imagen QR de Nequi o Bancolombia
     */
    public function uploadQrPago(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->bloqueado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta está bloqueada.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'tipo' => 'required|string|in:nequi_qr,bancolombia_qr',
                'imagen' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();
            $tipo = $data['tipo'];

            $path = $request->file('imagen')->store('qrs-pago', 'public');

            if ($tipo === 'nequi_qr') {
                if ($user->nequi_qr && Storage::disk('public')->exists($user->nequi_qr)) {
                    Storage::disk('public')->delete($user->nequi_qr);
                }
                $user->nequi_qr = $path;
            } else {
                if ($user->bancolombia_qr && Storage::disk('public')->exists($user->bancolombia_qr)) {
                    Storage::disk('public')->delete($user->bancolombia_qr);
                }
                $user->bancolombia_qr = $path;
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'QR subido correctamente',
                'data' => [
                    $tipo => $path,
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir la imagen',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper para obtener reseñas y promedios de un usuario.
     */
    private function obtenerResenasUsuario(string $email): array
    {
        try {
            $resenas = Resena::where('id_CorreoUsuario_Calificado', $email)
                ->with(['usuario:id_CorreoUsuario,nombre,apellido', 'servicio:id_Servicio,titulo,tipo'])
                ->orderBy('created_at', 'desc')
                ->get();

            $comoOfertante = $resenas->where('rol_calificado', 'ofertante')->values();
            $comoCliente = $resenas->where('rol_calificado', 'cliente')->values();

            $promedioOfertante = $comoOfertante->avg('calificacion_usuario') ?? 0;
            $promedioCliente = $comoCliente->avg('calificacion_usuario') ?? 0;

            return [
                'resenas_como_ofertante' => $comoOfertante,
                'resenas_como_cliente' => $comoCliente,
                'promedio_ofertante' => round($promedioOfertante, 1),
                'promedio_cliente' => round($promedioCliente, 1),
            ];
        } catch (\Exception $e) {
            return [
                'resenas_como_ofertante' => collect(),
                'resenas_como_cliente' => collect(),
                'promedio_ofertante' => 0,
                'promedio_cliente' => 0,
            ];
        }
    }

    /**
     * Bloquear usuario por email (solo admin) - Endpoint alternativo.
     */
    public function bloquearAdmin(Request $request, string $email)
    {
        try {
            $usuario = Usuario::where('id_CorreoUsuario', $email)->firstOrFail();

            $usuario->bloqueado = true;
            $usuario->save();

            Notificacion::create([
                'mensaje' => 'Tu cuenta ha sido bloqueada por administracion debido a contenido inapropiado.',
                'estado' => 'No leido',
                'tipo' => 'cuenta',
                'id_CorreoUsuario' => $usuario->id_CorreoUsuario,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Usuario bloqueado correctamente',
                'usuario' => $usuario,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al bloquear el usuario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
