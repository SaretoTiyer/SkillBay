<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Postulacion extends Model
{
    protected $table = 'postulaciones';

    protected $fillable = [
        'id_Servicio',
        'id_Usuario',
        'mensaje',
        'presupuesto',
        'tiempo_estimado',
        'estado'
    ];

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_Servicio', 'id_Servicio');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_Usuario', 'id_CorreoUsuario');
    }
}
