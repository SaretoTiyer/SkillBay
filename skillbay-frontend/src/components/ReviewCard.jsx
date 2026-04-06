import { Star, Briefcase, User } from "lucide-react";

export default function ReviewCard({ review, sectionRole = "ofertante" }) {
  const calificacionUsuario = review.calificacion_usuario || 0;
  const calificacionServicio = review.calificacion_servicio;
  const tieneCalificacionServicio = calificacionServicio !== null && calificacionServicio !== undefined;

  const contextoTexto = sectionRole === "ofertante"
    ? "Evaluación como proveedor del servicio"
    : "Evaluación como cliente";

  const badgeColor = sectionRole === "ofertante"
    ? "bg-blue-100 text-blue-700"
    : "bg-amber-100 text-amber-700";

  const badgeTexto = sectionRole === "ofertante"
    ? "OFERTANTE"
    : "CLIENTE";

  const nombreCalificador = review.usuario
    ? `${review.usuario.nombre || ""} ${review.usuario.apellido || ""}`.trim()
    : "Usuario Anónimo";

  const tituloServicio = review.servicio?.titulo || "Servicio no especificado";
  const fecha = review.created_at
    ? new Date(review.created_at).toLocaleDateString("es-CO", { day: 'numeric', month: 'short', year: 'numeric' })
    : "";

  return (
    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
      {/* Header: Badge + Fecha */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
          <User size={12} />
          {badgeTexto}
        </span>
        <span className="text-xs text-gray-400 font-medium">{fecha}</span>
      </div>

      {/* Contexto */}
      <p className="text-xs text-gray-500 mb-3">{contextoTexto}</p>

      {/* Calificación al usuario */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" role="img" aria-label={`Calificación: ${calificacionUsuario} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={`user-${star}`}
                size={16}
                className={star <= calificacionUsuario ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">{calificacionUsuario.toFixed(1)}</span>
          <span className="text-xs text-gray-400">/5</span>
        </div>

        {/* Calificación al servicio (solo si existe y aplica) */}
        {tieneCalificacionServicio && (
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Servicio:</span>
            <div className="flex items-center gap-1" role="img" aria-label={`Calificación al servicio: ${calificacionServicio} de 5 estrellas`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={`service-${star}`}
                  size={14}
                  className={star <= calificacionServicio ? "text-blue-400 fill-blue-400" : "text-gray-300"}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({calificacionServicio}/5)</span>
          </div>
        )}
      </div>

      {/* Servicio y Comentario */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1">
          <span className="font-medium">Servicio:</span> {tituloServicio}
        </p>
        {review.comentario && (
          <p className="text-gray-600 text-sm leading-relaxed">
            <span className="font-medium text-gray-700">Comentario:</span> {review.comentario}
          </p>
        )}
      </div>
    </div>
  );
}
