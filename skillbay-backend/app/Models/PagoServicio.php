<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Postulacion;
use App\Models\Usuario;

class PagoServicio extends Model
{
    protected $table = 'pago_servicios';
    protected $primaryKey = 'id_PagoServicio';

    protected $fillable = [
        'monto',
        'fechaPago',
        'estado',
        'metodoPago',
        'referenciaPago',
        'modalidadPago',
        'modalidadServicio',
        'identificacionCliente',
        'origenSolicitud',
        'id_Postulacion',
        'id_CorreoUsuario',
        'id_Servicio',
    ];

    public function servicio() {
        return $this->belongsTo(Servicio::class, 'id_Servicio');
    }

    public function postulacion() {
        return $this->belongsTo(Postulacion::class, 'id_Postulacion');
    }

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario', 'id_CorreoUsuario');
    }
}
