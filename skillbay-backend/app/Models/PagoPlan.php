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
        // Campos MercadoPago
        'mp_preference_id',
        'mp_payment_id',
        'mp_status',
        'mp_init_point',
        'mp_sandbox_init_point',
    ];

    protected $casts = [
        'fechaPago'       => 'datetime',
        'fechaInicioPlan' => 'date',
        'fechaFinPlan'    => 'date',
        'monto'           => 'decimal:2',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'id_Plan');
    }

    /**
     * Verifica si el pago fue aprobado por MercadoPago.
     */
    public function estaAprobado(): bool
    {
        return $this->estado === 'Completado' || $this->mp_status === 'approved';
    }

    /**
     * Verifica si el plan está vigente (no expirado).
     */
    public function estaVigente(): bool
    {
        if (!$this->fechaFinPlan) {
            return false;
        }
        return now()->lte($this->fechaFinPlan);
    }
}
