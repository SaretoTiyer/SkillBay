<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $table = 'servicios';
    protected $primaryKey = 'id_Servicio';

    protected $fillable = [
        'titulo',
        'descripcion',
        'id_Cliente', // Dueño del servicio (Ofertante)
        'estado',
        'precio',
        'imagen',
        'tiempo_entrega',
        'id_Contratista',
        'id_Categoria',
        'tipo', // 'servicio' o 'oportunidad'
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
