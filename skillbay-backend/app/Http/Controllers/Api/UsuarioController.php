<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario ;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
        // Registrar Usuario
        public function register(Request $request){
        $validated = $request->validate([
            'id_CorreoUsuario' => 'required|email|unique:usuario,id_CorreoUsuario',
            'nombre' => 'required|string',
            'password' => 'required|min:6',
            'rol' => 'nullable|string',
        ]);

        $user = Usuario::create([
            'id_CorreoUsuario' => $validated['id_CorreoUsuario'],
            'nombre' => $validated['nombre'],
            'genero' => $request->genero,
            'ubicacion' => $request->ubicacion,
            'password' => bcrypt($validated['password']),
            'rol' => $request->rol ?? 'ofertante',
            'fechaRegistro' => now(),
        ]);

        return response()->json(['message' => 'Usuario registrado correctamente', 'data' => $user], 201);
    }

    //  Verifica el Usuario y inicia sesión
    public function login(Request $request){ 

        $usuario = Usuario::where('id_CorreoUsuario', $request->id_CorreoUsuario)->first();

        if (!$usuario || !Hash::check($request->password, $usuario->password)){
            return response ()->json(['error' => 'Credenciales incorrectas'], 401);
        }

        return response()->json([
            'message' => 'Inicio de Sesión exitoso',
            'usuario' => $usuario 
        ]);

    }

    public function listar(){  //Muestra todos los usuarios 
        return response()->json([Usuario::all()]);
    }


}
