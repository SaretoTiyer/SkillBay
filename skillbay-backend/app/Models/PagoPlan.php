<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoPlan extends Model
{
    protected $fillable = ['monto','fechaPago','estado','metodoPago','fechaInicioPlan','fechaFinPlan','id_CorreoUsuario','id_Plan'];

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario');
    }

    public function plan() {
        return $this->belongsTo(Plan::class, 'id_Plan');
    }
}

