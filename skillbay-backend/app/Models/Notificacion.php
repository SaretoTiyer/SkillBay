<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    protected $primaryKey = 'id_Notificacion';

    protected $fillable = ['mensaje','estado','tipo','id_CorreoUsuario'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario', 'id_CorreoUsuario');
    }
}
