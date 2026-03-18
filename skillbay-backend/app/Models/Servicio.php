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
        'id_Cliente', // Dueño del servicio (ofertante / cliente)
        'estado',
        'precio',
        'imagen',
        'tiempo_entrega',
        'id_Categoria',
        'tipo', // 'servicio' o 'oportunidad'
        'urgencia',
        'ubicacion',
        'metodos_pago',
        'modo_trabajo',
    ];

    public function cliente()
    {
        return $this->belongsTo(Usuario::class, 'id_Cliente', 'id_CorreoUsuario');
    }

    public function cliente_usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_Cliente', 'id_CorreoUsuario');
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_Categoria', 'id_Categoria');
    }
}
