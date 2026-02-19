<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $primaryKey = 'id_Categoria';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id_Categoria', 'nombre', 'grupo', 'descripcion', 'imagen'];

    public function servicios() {
        return $this->hasMany(Servicio::class, 'id_Categoria');
    }
}
