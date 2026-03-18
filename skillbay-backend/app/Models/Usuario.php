<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $primaryKey = 'id_CorreoUsuario';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id_CorreoUsuario',
        'id_Plan',
        'nombre',
        'apellido',
        'genero',
        'telefono',
        'ciudad',
        'departamento',
        'fechaNacimiento',
        'password',
        'rol',
        'bloqueado',
        'fechaRegistro',
        'imagen_perfil',
        'nequi_numero',
        'nequi_nombre',
        'nequi_qr',
        'bancolombia_qr',
        'metodos_pago_activos',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'bloqueado' => 'boolean',
        'fechaNacimiento' => 'date',
        'metodos_pago_activos' => 'array',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'id_Plan');
    }
}
