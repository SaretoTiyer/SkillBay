<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    protected $fillable = ['titulo','descripcion','id_Cliente','estado','precio','id_Contratista','id_Categoria'];

    public function categoria() {
        return $this->belongsTo(Categoria::class, 'id_Categoria');
    }

    public function cliente() {
        return $this->belongsTo(Usuario::class, 'id_Cliente');
    }

    public function contratista() {
        return $this->belongsTo(Usuario::class, 'id_Contratista');
    }
}
