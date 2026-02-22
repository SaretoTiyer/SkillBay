<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    protected $primaryKey = 'id_Notificacion';
    
    // Forzar el nombre de la tabla en SQLite
    protected $tableAttributes = [
        'table' => 'notificaciones',
    ];

    protected $fillable = ['mensaje','estado','tipo','id_CorreoUsuario'];

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'id_CorreoUsuario');
    }
    
    /**
     * Obtener el nombre de la tabla correctamente
     */
    public function getTable()
    {
        return 'notificaciones';
    }
}
