/**
 * Utilidad centralizada para determinar el contexto de calificación.
 * 
 * SEMÁNTICA DE ROLES:
 * 
 * SERVICIO (el ofertante publica un servicio):
 * - id_Dueno = OFERTANTE (quien publica/provee el servicio)
 * - Postulante = CLIENTE (quien contrata/recibe el servicio)
 * 
 * OPORTUNIDAD (el cliente publica una necesidad):
 * - id_Dueno = CLIENTE (quien publica/necesita el servicio)
 * - Postulante = OFERTANTE (quien ofrece sus servicios)
 * 
 * Reglas de calificación:
 * 
 * SERVICIO:
 * - El CLIENTE (postulante) califica al OFERTANTE (id_Dueno) → rol_calificado: "ofertante", califica_servicio: SÍ
 * - El OFERTANTE (id_Dueno) califica al CLIENTE (postulante) → rol_calificado: "cliente", califica_servicio: NO
 * 
 * OPORTUNIDAD:
 * - El CLIENTE (id_Dueno) califica al OFERTANTE (postulante) → rol_calificado: "ofertante", califica_servicio: NO
 * - El OFERTANTE (postulante) califica al CLIENTE (id_Dueno) → rol_calificado: "cliente", califica_servicio: NO
 * 
 * @param {string} tipoServicio - "servicio" | "oportunidad"
 * @param {string} emailUsuarioActual - Email del usuario logueado
 * @param {string} emailDueno - Email del id_Dueno del servicio
 * @param {string} emailPostulante - Email del postulante (id_Usuario de la postulación)
 * @returns {{ usuarioCalificado: string, rolCalificado: string, showServiceRating: boolean, error: string|null }}
 */
export function determinarContextoCalificacion(
  tipoServicio,
  emailUsuarioActual,
  emailDueno,
  emailPostulante
) {
  if (!tipoServicio || !emailUsuarioActual) {
    return { error: "Datos insuficientes para determinar contexto", usuarioCalificado: "", rolCalificado: "", showServiceRating: false };
  }

  const esDueno = emailUsuarioActual === emailDueno;
  const esPostulante = emailUsuarioActual === emailPostulante;

  if (tipoServicio === "servicio") {
    // En SERVICIO: id_Dueno = OFERTANTE, Postulante = CLIENTE
    if (esDueno) {
      // El OFERTANTE (id_Dueno) califica al CLIENTE (postulante)
      return {
        usuarioCalificado: emailPostulante,
        rolCalificado: "cliente",
        showServiceRating: false,
        error: null
      };
    } else if (esPostulante) {
      // El CLIENTE (postulante) califica al OFERTANTE (id_Dueno)
      return {
        usuarioCalificado: emailDueno,
        rolCalificado: "ofertante",
        showServiceRating: true,
        error: null
      };
    } else {
      return { error: "Usuario no participa en esta postulación", usuarioCalificado: "", rolCalificado: "", showServiceRating: false };
    }
  }

  if (tipoServicio === "oportunidad") {
    // En OPORTUNIDAD: id_Dueno = CLIENTE, Postulante = OFERTANTE
    if (esDueno) {
      // El CLIENTE (id_Dueno) califica al OFERTANTE (postulante)
      return {
        usuarioCalificado: emailPostulante,
        rolCalificado: "ofertante",
        showServiceRating: false,
        error: null
      };
    } else if (esPostulante) {
      // El OFERTANTE (postulante) califica al CLIENTE (id_Dueno)
      return {
        usuarioCalificado: emailDueno,
        rolCalificado: "cliente",
        showServiceRating: false,
        error: null
      };
    } else {
      return { error: "Usuario no participa en esta postulación", usuarioCalificado: "", rolCalificado: "", showServiceRating: false };
    }
  }

  return { error: "Tipo de servicio desconocido", usuarioCalificado: "", rolCalificado: "", showServiceRating: false };
}
