<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Postulacion extends Model
{
    protected $table = 'postulaciones';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_Servicio',
        'id_Usuario',
        'mensaje',
        'presupuesto',
        'tiempo_estimado',
        'estado',
        'tipo_postulacion', // 'postulante' o 'solicitante'
    ];

    /**
     * Relación con el servicio al que pertenece la postulación
     */
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_Servicio', 'id_Servicio');
    }

    /**
     * Relación con el usuario que realizó la postulación
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_Usuario', 'id_CorreoUsuario');
    }

    /**
     * Determina si la postulación es de tipo 'postulante'
     * (el usuario aplica a una oportunidad publicada por un cliente)
     * En este caso, el cliente paga al postulador.
     */
    public function esPostulante(): bool
    {
        return $this->tipo_postulacion === 'postulante';
    }

    /**
     * Determina si la postulación es de tipo 'solicitante'
     * (el usuario solicita un servicio a un ofertante)
     * En este caso, el solicitante paga al proveedor/ofertante.
     */
    public function esSolicitante(): bool
    {
        return $this->tipo_postulacion === 'solicitante';
    }

    /**
     * Obtiene el rol del usuario en esta postulación
     * Retorna 'postulante' o 'solicitante'
     */
    public function getTipoPostulacion(): string
    {
        return $this->tipo_postulacion ?? 'postulante';
    }

    /**
     * Determina quién debe pagar en esta postulación
     * Retorna el email del usuario que debe realizar el pago
     */
    public function getUsuarioQuePaga(): ?string
    {
        if ($this->esPostulante()) {
            // El cliente (dueño del servicio) paga al postulante
            return $this->servicio?->id_Dueno;
        } else {
            // El solicitante paga al proveedor (ofertante)
            return $this->id_Usuario;
        }
    }

    /**
     * Determina quién recibe el pago en esta postulación
     * Retorna el email del usuario que debe recibir el pago
     */
    public function getUsuarioQueRecibe(): ?string
    {
        if ($this->esPostulante()) {
            // El postulante recibe el pago
            return $this->id_Usuario;
        } else {
            // El proveedor (ofertante del servicio) recibe el pago
            return $this->servicio?->id_Dueno;
        }
    }
}
