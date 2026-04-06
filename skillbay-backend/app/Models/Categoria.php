<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Categoria extends Model
{
    protected $primaryKey = 'id_Categoria';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id_Categoria', 'nombre', 'grupo', 'descripcion', 'imagen'];

    /**
     * Devuelve siempre una URL completa (https en prod, http en local).
     * Acepta tanto rutas relativas ("categorias/foo.jpg") como URLs completas.
     */
    public function getImagenAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        // Ya es una URL completa — devolver tal cual (Storage::url no es necesario)
        if (str_starts_with($value, 'http')) {
            return $value;
        }

        // Ruta relativa → generar URL mediante el disco público
        return Storage::url($value);
    }

    public function servicios()
    {
        return $this->hasMany(Servicio::class, 'id_Categoria');
    }
}

