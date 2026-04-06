<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $table = 'servicios';

    protected $primaryKey = 'id_Servicio';

    protected $casts = [
        'metodos_pago' => 'array',
    ];

    protected $fillable = [
        'titulo',
        'descripcion',
        'id_Dueno',
        'estado',
        'precio',
        'imagen',
        'tiempo_entrega',
        'id_Categoria',
        'tipo',
        'urgencia',
        'ubicacion',
        'metodos_pago',
        'modo_trabajo',
        'fechaPublicacion',
    ];

    public function dueno()
    {
        return $this->belongsTo(Usuario::class, 'id_Dueno', 'id_CorreoUsuario');
    }

    public function cliente_usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_Dueno', 'id_CorreoUsuario');
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_Categoria', 'id_Categoria');
    }
}
