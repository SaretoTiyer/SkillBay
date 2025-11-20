<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoServicio extends Model
{
    protected $fillable = ['monto','fechaPago','estado','metodoPago','id_Servicio'];

    public function servicio() {
        return $this->belongsTo(Servicio::class, 'id_Servicio');
    }
}

