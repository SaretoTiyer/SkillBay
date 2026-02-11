<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios' ;
    protected $primaryKey = 'id_CorreoUsuario' ;
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false ;

    protected $fillable = [
        'id_CorreoUsuario',
        'nombre',
        'apellido',
        'genero',
        'telefono',
        'ciudad',
        'departamento',
        'password',
        'rol',
        'fechaRegistro',
    ];


}
