<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthRecoveryController extends Controller
{
    public function solicitarRecuperacion(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:191',
        ]);

        $email = strtolower(trim($validated['email']));
        $usuario = Usuario::find($email);
        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' => 'No existe una cuenta asociada a ese correo.',
            ], 404);
        }

        $domain = substr(strrchr($email, "@"), 1);
        if (!$domain || !checkdnsrr($domain, 'MX')) {
            return response()->json([
                'success' => false,
                'message' => 'El dominio del correo no parece activo.',
            ], 422);
        }

        $token = Str::upper(Str::random(6));
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($token),
                'expires_at' => Carbon::now()->addMinutes(20),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        try {
            Mail::raw(
                "Hola,\n\nTu codigo de recuperacion de SkillBay es: {$token}\n\nEste codigo vence en 20 minutos.",
                function ($message) use ($email) {
                    $message->to($email)->subject('Recuperacion de contrasena - SkillBay');
                }
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo enviar el correo. Verifica configuracion SMTP.',
                'error' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Se envio un codigo de recuperacion a tu correo.',
        ]);
    }

    public function restablecerContrasena(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:191',
            'codigo' => 'required|string|min:6|max:10',
            'password' => [
                'required',
                'string',
                'min:8',
                'max:100',
                'regex:/^\S+$/',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,15}$/',
            ],
        ]);

        $email = strtolower(trim($validated['email']));
        $row = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Codigo no valido.'], 422);
        }

        if (Carbon::parse($row->expires_at)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json(['success' => false, 'message' => 'El codigo ha expirado.'], 422);
        }

        if (!Hash::check($validated['codigo'], $row->token)) {
            return response()->json(['success' => false, 'message' => 'Codigo incorrecto.'], 422);
        }

        $usuario = Usuario::findOrFail($email);
        $usuario->password = Hash::make($validated['password']);
        $usuario->save();

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contrasena actualizada correctamente.',
        ]);
    }
}
