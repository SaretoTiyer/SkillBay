<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    protected $table = 'resenas';

    protected $fillable = [
        'calificacion',
        'comentario',
        'fechaResena',
        'metodoPago',
        'id_Servicio',
        'id_CorreoUsuario',
        'direccion',
        'id_Postulacion',
    ];

    protected $casts = [
        'fechaResena'  => 'datetime',
        'calificacion' => 'integer',
    ];

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_Servicio');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario', 'id_CorreoUsuario');
    }

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'id_Postulacion');
    }
}