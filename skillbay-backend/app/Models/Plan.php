<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $table = 'planes';
    protected $primaryKey = 'id_Plan';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id_Plan', 'nombre', 'beneficios', 'precioMensual', 'limiteServiciosMes'];

    public function usuarios() {
        return $this->hasMany(Usuario::class, 'id_Plan');
    }
}
