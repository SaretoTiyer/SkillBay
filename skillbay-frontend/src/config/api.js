// Normaliza la URL base eliminando trailing slashes y asegurando que
// siempre termine en /api, tanto si el secret incluye /api como si no.
const _base = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '')

export const API_URL = import.meta.env.DEV
  ? '/api'
  : (_base.endsWith('/api') ? _base : `${_base}/api`)

export const API_Departamentos = 'https://api-colombia.com/api/v1/Department'
