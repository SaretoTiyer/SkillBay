<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reporte extends Model
{
    protected $table = 'reportes';
    protected $primaryKey = 'id_Reporte';

    protected $fillable = [
        'id_Reportador',
        'id_Reportado',
        'id_Servicio',
        'id_Postulacion',
        'motivo',
        'estado',
    ];

    public function reportador()
    {
        return $this->belongsTo(Usuario::class, 'id_Reportador', 'id_CorreoUsuario');
    }

    public function reportado()
    {
        return $this->belongsTo(Usuario::class, 'id_Reportado', 'id_CorreoUsuario');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_Servicio', 'id_Servicio');
    }

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'id_Postulacion', 'id');
    }
}
