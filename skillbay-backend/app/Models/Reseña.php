<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reseña extends Model
{
    protected $fillable = [
        'calificacion',
        'comentario',
        'fechaReseña',
        'metodoPago',
        'id_Servicio',
        'id_CorreoUsuario',
        // Nuevos campos para reseñas bidireccionales
        'direccion',      // 'cliente_a_ofertante' o 'ofertante_a_cliente'
        'id_Postulacion', // Relación con la transacción específica
    ];

    public function servicio() {
        return $this->belongsTo(Servicio::class, 'id_Servicio');
    }

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario', 'id_CorreoUsuario');
    }

    public function postulacion() {
        return $this->belongsTo(Postulacion::class, 'id_Postulacion');
    }

    // Relación con el usuario que recibe la reseña (el calificado)
    public function usuarioCalificado() {
        if ($this->direccion === 'cliente_a_ofertante') {
            // Si el cliente reseña al ofertante, el calificado es el del servicio
            return $this->belongsTo(Usuario::class, 'id_CorreoUsuario', 'id_CorreoUsuario');
        }
        // Para ofertante_a_cliente, necesitamos otro campo
        return null;
    }
}
