<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario ;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    
    public function register(Request $request){ //Registrar un Usuario

        $request->validate([
            'id_CorreoUsuario' => 'required|email|unique:Usuario,id_CorreoUsuario',
            'nombre'=>'required|string|max:255',
            'password'=>'required|min:6'
        ]);


        
        $rol = $request ->rol ?? 'ofertante';//Se asigna el 'ofertante' por defecto, si no se envia el rol 
        $rolesPermitidos = ['ofertante','oferente','admin'];

        if(!in_array($rol, $rolesPermitidos)){
            return response()->json(['error' => 'Rol no valido'], 400);
        }


        $usuario = Usuario::create([
            'id_CorreoUsuario' => $request->id_CorreoUsuario,
            'nombre' => $request->nombre,
            'genero' => $request->genero,
            'ubicacion' => $request->ubicacion,
            'password' => $request->password,
            'rol' => $request->rol,
            'fechaRegistro' => $request->fechaRegistro,
            'id_Plan' => $request->id_Plan,
        ]);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'usuario' => $usuario
        ]);

    }

    public function login(Request $request){ //  Verifica el Usuario y inicia sesión

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
