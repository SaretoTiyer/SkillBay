<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoPlan extends Model
{
    protected $table = 'pago_planes';

    protected $primaryKey = 'id_PagoPlan';

    protected $fillable = [
        'monto',
        'fechaPago',
        'estado',
        'metodoPago',
        'referenciaPago',
        'modalidadPago',
        'fechaInicioPlan',
        'fechaFinPlan',
        'id_CorreoUsuario',
        'id_Plan',
    ];

    protected $casts = [
        'fechaPago' => 'datetime',
        'fechaInicioPlan' => 'date',
        'fechaFinPlan' => 'date',
        'monto' => 'decimal:2',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'id_Plan');
    }

    public function estaAprobado(): bool
    {
        return $this->estado === 'Completado';
    }

    public function estaVigente(): bool
    {
        if (! $this->fechaFinPlan) {
            return false;
        }

        return now()->lte($this->fechaFinPlan);
    }
}
