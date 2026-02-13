<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mensaje extends Model
{
    protected $table = 'mensajes';
    protected $primaryKey = 'id_Mensaje';

    protected $fillable = [
        'id_Postulacion',
        'id_Emisor',
        'mensaje',
        'expiraEn',
    ];

    protected $casts = [
        'expiraEn' => 'datetime',
    ];

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'id_Postulacion', 'id');
    }

    public function emisor()
    {
        return $this->belongsTo(Usuario::class, 'id_Emisor', 'id_CorreoUsuario');
    }
}
