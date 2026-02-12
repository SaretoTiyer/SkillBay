<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use App\Models\Plan;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

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
                'password' => [
                    'required',
                    'string',
                    'min:6',
                    'max:100',
                    'regex:/^\S+$/', // sin espacios
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,15}$/' // Mínimo 8, máximo 15, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
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
                'password.regex' => 'La contraseña no puede contener espacios.',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();

            $planDefault = 'Free';
            if (!Plan::where('id_Plan', $planDefault)->exists()) {
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
                'password' => Hash::make($data['password']),
                'rol' => $data['rol'] ?? 'cliente',
                'id_Plan' => $data['id_Plan'] ?? $planDefault,
                'bloqueado' => false,
                'fechaRegistro' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'usuario' => $user
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
                'id_CorreoUsuario' => ['required','email','regex:/^\S+$/'],
                'password' => ['required','string','min:6','regex:/^\S+$/'],
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

            if (!$usuario || !Hash::check($data['password'], $usuario->password)) {
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

            // Crear token
            $token = $usuario->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso.',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'usuario' => $usuario
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
            'usuario' => $request->user()
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
                'telefono' => 'nullable|string|min:7|max:20|regex:/^[0-9+\-\s]+$/|unique:usuarios,telefono,' . $user->id_CorreoUsuario . ',id_CorreoUsuario',
                'ciudad' => 'nullable|string|max:100',
                'departamento' => 'nullable|string|max:100',
                'id_Plan' => 'nullable|string|exists:planes,id_Plan',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $data = $validator->validated();
            
            // Actualizar campos si vienen en la petición
            if(isset($data['nombre'])) $user->nombre = strip_tags(trim($data['nombre']));
            if(isset($data['apellido'])) $user->apellido = strip_tags(trim($data['apellido']));
            if(isset($data['genero'])) $user->genero = $data['genero'];
            if(isset($data['telefono'])) $user->telefono = strip_tags(trim($data['telefono']));
            if(isset($data['ciudad'])) $user->ciudad = strip_tags(trim($data['ciudad']));
            if(isset($data['departamento'])) $user->departamento = strip_tags(trim($data['departamento']));
            if(isset($data['id_Plan'])) $user->id_Plan = $data['id_Plan'];

            // Guardar cambios - Importante: usar save() en el modelo Usuario
            // Asegúrate de que el modelo Usuario tenga definida la primaryKey correctamente si no es 'id'
            $user->save();

            if (isset($data['id_Plan'])) {
                Notificacion::create([
                    'mensaje' => 'Tu plan ahora es ' . $data['id_Plan'] . '.',
                    'estado' => 'No leido',
                    'tipo' => 'plan',
                    'id_CorreoUsuario' => $user->id_CorreoUsuario,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado correctamente',
                'usuario' => $user
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
     * Listar todos los usuarios
     */
    public function listarAdmin(Request $request)
    {
        try {
            $admin = $request->user();
            if (!$admin || $admin->rol !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

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
            $admin = $request->user();
            if (!$admin || $admin->rol !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

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
     * Listar todos los usuarios
     */
    public function listar()
    {
        try {
            $usuarios = Usuario::all();
            return response()->json([
                'success' => true,
                'total' => $usuarios->count(),
                'usuarios' => $usuarios
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los usuarios',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
