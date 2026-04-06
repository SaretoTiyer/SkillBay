<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    protected $table = 'resenas';

    protected $primaryKey = 'id_Reseña';

    protected $fillable = [
        'calificacion_usuario',
        'calificacion_servicio',
        'comentario',
        'id_Servicio',
        'id_CorreoUsuario',
        'id_CorreoUsuario_Calificado',
        'rol_calificado',
        'id_Postulacion',
    ];

    protected $casts = [
        'calificacion_usuario' => 'integer',
        'calificacion_servicio' => 'integer',
        'rol_calificado' => 'string',
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

    public function usuarioCalificado()
    {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario_Calificado', 'id_CorreoUsuario');
    }
}
