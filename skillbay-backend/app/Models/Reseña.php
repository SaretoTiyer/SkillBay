<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reseña extends Model
{
    protected $fillable = ['calificacion','comentario','fechaReseña','metodoPago','id_Servicio', 'id_CorreoUsuario'];

    public function servicio() {
        return $this->belongsTo(Servicio::class, 'id_Servicio');
    }

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario', 'id_CorreoUsuario');
    }
}
