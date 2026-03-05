<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Postulacion;
use App\Models\Usuario;

class PagoServicio extends Model
{
    protected $table = 'pago_servicios';
    protected $primaryKey = 'id_PagoServicio';

    protected $fillable = [
        'monto',
        'fechaPago',
        'estado',
        'metodoPago',
        'referenciaPago',
        'modalidadPago',
        'modalidadServicio',
        'identificacionCliente',
        'origenSolicitud',
        'id_Postulacion',
        'id_Servicio',
        // Campos para flujo correcto de dinero:
        // - id_Pagador:  quien transfiere el dinero (el cliente que solicita el servicio)
        // - id_Receptor: quien recibe el dinero (el proveedor que ejecuta el servicio)
        'id_Pagador',   // Quién paga
        'id_Receptor',  // Quién recibe
    ];

    /**
     * Servicio relacionado con este pago
     */
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_Servicio');
    }

    /**
     * Postulación relacionada con este pago
     */
    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'id_Postulacion');
    }

    /**
     * Pagador: usuario que realiza el pago (cliente que solicita el servicio)
     */
    public function pagador()
    {
        return $this->belongsTo(Usuario::class, 'id_Pagador', 'id_CorreoUsuario');
    }

    /**
     * Receptor: usuario que recibe el pago (proveedor que ejecuta el servicio)
     */
    public function receptor()
    {
        return $this->belongsTo(Usuario::class, 'id_Receptor', 'id_CorreoUsuario');
    }

    /**
     * Alias de compatibilidad: cliente = pagador
     */
    public function cliente()
    {
        return $this->pagador();
    }

    /**
     * Alias de compatibilidad: prestador = receptor
     */
    public function prestador()
    {
        return $this->receptor();
    }

    /**
     * Obtiene el email del usuario que pagó
     */
    public function getUsuarioQuePaga(): ?string
    {
        return $this->id_Pagador;
    }

    /**
     * Obtiene el email del usuario que recibió el pago
     */
    public function getUsuarioQueRecibe(): ?string
    {
        return $this->id_Receptor;
    }
}
