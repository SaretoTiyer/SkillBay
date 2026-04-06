<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessage as ContactMessageMailable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:150',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|min:3|max:200',
            'message' => 'required|string|min:10|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos invalidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            Mail::to('skillbay.app@gmail.com')->send(
                new ContactMessageMailable(
                    name: $request->input('name'),
                    email: $request->input('email'),
                    contactSubject: $request->input('subject'),
                    messageBody: $request->input('message'),
                )
            );

            return response()->json([
                'message' => 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al enviar el mensaje. Intentalo de nuevo mas tarde.',
            ], 500);
        }
    }
}
