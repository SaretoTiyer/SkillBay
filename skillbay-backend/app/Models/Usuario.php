<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    use HasFactory;

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
