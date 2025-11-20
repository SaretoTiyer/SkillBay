<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $fillable = ['mensaje','estado','tipo','id_CorreoUsuario'];

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario');
    }
}

