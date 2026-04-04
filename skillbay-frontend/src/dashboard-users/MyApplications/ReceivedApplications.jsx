import { useEffect, useState, useMemo, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  MessageSquare,
  Star,
  XCircle,
  Briefcase,
  Users,
  FileCheck,
  Send,
  Eye,
  EyeOff,
  Calendar,
  User,
} from "lucide-react";
import { showSuccess, showError, showConfirm } from "../../utils/swalHelpers";
import { API_URL } from "../../config/api";
import { getServiceImage } from "../../utils/serviceImages";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/Button";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import RatingModal from "../../components/RatingModal";
import { determinarContextoCalificacion } from "../../utils/ratingContext";

// ============================================
// STATUS CONFIG (CENTRALIZED)
// ============================================

const STATUS_CONFIG = {
  pendiente: {
    label: "Pendiente",
    color: "amber",
    bg: "bg-amber-500",
    border: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  aceptada: {
    label: "Aceptada",
    color: "emerald",
    bg: "bg-emerald-500",
    border: "border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
  en_progreso: {
    label: "En Progreso",
    color: "blue",
    bg: "bg-blue-500",
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700",
    icon: Briefcase,
  },
  completada: {
    label: "Completada",
    color: "purple",
    bg: "bg-purple-500",
    border: "border-l-purple-500",
    badge: "bg-purple-100 text-purple-700",
    icon: FileCheck,
  },
  pagada: {
    label: "Pagada",
    color: "green",
    bg: "bg-green-500",
    border: "border-l-green-500",
    badge: "bg-green-100 text-green-700",
    icon: DollarSign,
  },
  rechazada: {
    label: "Rechazada",
    color: "red",
    bg: "bg-red-500",
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  cancelada: {
    label: "Cancelada",
    color: "slate",
    bg: "bg-slate-500",
    border: "border-l-slate-500",
    badge: "bg-slate-100 text-slate-700",
    icon: XCircle,
  },
};

// ============================================
// SKELETON
// ============================================

function ReceivedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex gap-4 p-4">
            <div className="w-20 h-20 bg-gray-200 animate-pulse rounded-xl shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full" />
                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// COLLAPSIBLE MESSAGE COMPONENT
// ============================================

function CollapsibleMessage({ message }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = message && message.length > 100;
  const displayText = isLong && !expanded ? message.slice(0, 100) + "..." : message;

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-start gap-2">
        <MessageSquare size={14} className="text-slate-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-slate-600 italic">"{displayText}"</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1.5 flex items-center gap-1"
            >
              {expanded ? (
                <>
                  <EyeOff size={12} /> Ver menos
                </>
              ) : (
                <>
                  <Eye size={12} /> Ver mensaje completo
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// AVATAR COMPONENT
// ============================================

function UserAvatar({ usuario }) {
  const initials = (usuario?.nombre?.[0] || "") + (usuario?.apellido?.[0] || "");
  const fullName = `${usuario?.nombre || ""} ${usuario?.apellido || ""}`.trim() || "Usuario";

  return (
    <div className="relative group">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
        {initials.toUpperCase() || "U"}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {fullName}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ReceivedApplications() {
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingService, setRatingService] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  const authHeaders = (json = false) => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/user`, { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        if (data.usuario) {
          setCurrentUserEmail(data.usuario.id_CorreoUsuario);
        }
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchSolicitudesRecibidas(), fetchCurrentUser()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitudesRecibidas = async () => {
    try {
      const response = await fetch(`${API_URL}/servicios/solicitudes`, { headers: authHeaders() });
      if (!response.ok) return;
      const data = await response.json();
      setSolicitudesRecibidas(Array.isArray(data.solicitudes) ? data.solicitudes : []);
    } catch (err) {
      console.error("Error fetching solicitudes:", err);
    }
  };

  const updateStatus = async (postulacionId, newStatus) => {
    const confirmMessages = {
      aceptada: "¿Aceptar esta postulación? El postulante será notificado.",
      rechazada: "¿Rechazar esta postulación? El postulante será notificado.",
      en_progreso: "¿Iniciar el trabajo con este postulante?",
    };

    const titles = {
      aceptada: "Aceptar Postulación",
      rechazada: "Rechazar Postulación",
      en_progreso: "Iniciar Trabajo",
    };

    const result = await showConfirm(
      titles[newStatus],
      confirmMessages[newStatus],
      "Sí"
    );

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/servicios/solicitudes/${postulacionId}/estado`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ estado: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo actualizar el estado.");

      showSuccess(
        newStatus === "aceptada" ? "Postulación aceptada" :
        newStatus === "rechazada" ? "Postulación rechazada" : "Trabajo iniciado"
      );

      if (newStatus === "rechazada") {
        setSolicitudesRecibidas((prev) => prev.filter((s) => s.id !== postulacionId));
      } else {
        fetchSolicitudesRecibidas();
      }
    } catch (error) {
      showError("Error", error.message);
    }
  };

  const getRequestType = (request) => {
    return request?.servicio?.tipo === "servicio" ? "servicio" : "oportunidad";
  };

  const getStatusBadge = useCallback((status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
    const Icon = config.icon;
    return (
      <Badge className={`${config.bg} text-white border-0 px-2 py-0.5 text-xs`}>
        <Icon size={12} className="inline mr-1" />
        {config.label}
      </Badge>
    );
  }, []);

  // ============================================ 
  // GROUP BY TYPE
  // ============================================

  const groupedRequests = useMemo(() => {
    const oportunidades = solicitudesRecibidas.filter((r) => r?.servicio?.tipo !== "servicio");
    const servicios = solicitudesRecibidas.filter((r) => r?.servicio?.tipo === "servicio");
    return { oportunidades, servicios };
  }, [solicitudesRecibidas]);

  // ============================================
  // APPLICATION CARD
  // ============================================

  const ReceivedRequestCard = ({ request }) => {
    const requestType = getRequestType(request);
    const precio = request.presupuesto || request.servicio?.precio || 0;

    return (
      <div
        className={`bg-white rounded-2xl border border-gray-100 border-l-4 shadow-sm transition-all hover:shadow-md ${
          STATUS_CONFIG[request.estado]?.border || "border-l-gray-300"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* Service Image */}
          <div className="relative w-full sm:w-24 h-20 shrink-0 rounded-xl overflow-hidden">
            <ImageWithFallback
              src={getServiceImage(request.servicio)}
              alt={request.servicio?.titulo || "Servicio"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {requestType === "servicio" ? (
                    <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] h-5">
                      <Users size={10} className="mr-1" /> Servicio
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px] h-5">
                      <Briefcase size={10} className="mr-1" /> Oportunidad
                    </Badge>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-800 truncate">
                  {request?.servicio?.titulo || "Servicio"}
                </h3>
              </div>
              <div className="shrink-0">{getStatusBadge(request.estado)}</div>
            </div>

            {/* Applicant Info Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-2">
              <div className="flex items-center gap-2">
                <UserAvatar usuario={request.usuario} />
                <span className="text-slate-600 font-medium">
                  {request.usuario?.nombre} {request.usuario?.apellido}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign size={12} className="text-emerald-500" />
                <span className="text-slate-600 font-medium">
                  ${Number(precio).toLocaleString("es-CO")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-indigo-500" />
                <span className="text-slate-500">
                  {request.created_at
                    ? new Date(request.created_at).toLocaleDateString("es-CO")
                    : "—"}
                </span>
              </div>
            </div>

            {/* Message */}
            {request.mensaje && <CollapsibleMessage message={request.mensaje} />}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100">
              {request.estado === "pendiente" && (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                    onClick={() => updateStatus(request.id, "aceptada")}
                  >
                    <CheckCircle size={14} className="mr-1" /> Aceptar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 h-8"
                    onClick={() => updateStatus(request.id, "rechazada")}
                  >
                    <XCircle size={14} className="mr-1" /> Rechazar
                  </Button>
                </>
              )}
              {request.estado === "aceptada" && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                  onClick={() => updateStatus(request.id, "en_progreso")}
                >
                  <Briefcase size={14} className="mr-1" /> Iniciar Trabajo
                </Button>
              )}
              {request.estado === "en_progreso" && (
                requestType === "oportunidad" ? (
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white h-8"
                    onClick={async () => {
                      const confirm = await showConfirm(
                        "¿Marcar trabajo como completado?",
                        "Confirmas que el trabajo fue realizado correctamente.",
                        "Sí, está completado"
                      );
                      if (!confirm.isConfirmed) return;
                      try {
                        const response = await fetch(`${API_URL}/postulaciones/${request.id}/completar`, {
                          method: "PATCH",
                          headers: authHeaders(true),
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data?.message || "Error al marcar como completado.");
                        fetchSolicitudesRecibidas();
                        showSuccess("¡Completado!", "El trabajo ha sido marcado como completado.");
                      } catch (error) {
                        showError("Error", error.message);
                      }
                    }}
                  >
                    <FileCheck size={14} className="mr-1" /> Completar
                  </Button>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 border-0 h-7">
                    <Briefcase size={12} className="mr-1" /> En progreso — esperando al cliente
                  </Badge>
                )
              )}
              {request.estado === "completada" && (
                requestType === "oportunidad" ? (
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-purple-100 text-purple-700 border-0 h-7">
                      <FileCheck size={12} className="mr-1" /> Esperando pago
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                      onClick={async () => {
                        const confirm = await showConfirm(
                          "¿Pagar al postulante?",
                          "El pago será realizado al postulante que completó el trabajo.",
                          "Sí, pagar"
                        );
                        if (!confirm.isConfirmed) return;
                        try {
                          const response = await fetch(`${API_URL}/pagos/servicio`, {
                            method: "POST",
                            headers: authHeaders(true),
                            body: JSON.stringify({
                              id_Servicio: request.servicio.id_Servicio,
                              modalidadPago: "virtual",
                              modalidadServicio: "presencial",
                              identificacionCliente: "12345678",
                              origenSolicitud: "postulacion",
                              id_Postulacion: request.id,
                              monto: precio,
                            }),
                          });
                          const data = await response.json();
                          if (!response.ok) throw new Error(data?.message || "Error al procesar el pago.");
                          fetchSolicitudesRecibidas();
                          showSuccess("¡Pago exitoso!", "El pago ha sido procesado.");
                        } catch (error) {
                          showError("Error", error.message);
                        }
                      }}
                    >
                      <DollarSign size={14} className="mr-1" /> Pagar
                    </Button>
                  </div>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-0 h-7">
                    <Clock size={12} className="mr-1" /> Esperando pago del cliente
                  </Badge>
                )
              )}
              {request.estado === "pagada" && (
                <div className="flex gap-2 flex-wrap items-center">
                  <Badge className="bg-green-500 text-white border-0 h-7">
                    <DollarSign size={12} className="mr-1" /> Pagada
                  </Badge>
                  {request.ya_califico_receptor ? (
                    <Badge className="bg-slate-200 text-slate-600 border-0 h-7 px-3">
                      <Star size={12} className="mr-1" /> Calificado
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white h-8"
                      onClick={() => {
                        const contexto = determinarContextoCalificacion(
                          request.servicio?.tipo || "servicio",
                          currentUserEmail,
                          request.servicio?.id_Dueno,
                          request.usuario?.id_CorreoUsuario
                        );

                        if (contexto.error) {
                          showError("Error", contexto.error);
                          return;
                        }

                        setRatingService({
                          id_Servicio: request.servicio.id_Servicio,
                          id_Postulacion: request.id,
                          tipo: request.servicio?.tipo || "servicio",
                          servicio: request.servicio,
                          usuario: request.usuario,
                          usuarioCalificado: contexto.usuarioCalificado,
                          rolCalificado: contexto.rolCalificado,
                          showServiceRating: contexto.showServiceRating,
                        });
                        setShowRatingModal(true);
                      }}
                    >
                      <Star size={14} className="mr-1" /> Calificar
                    </Button>
                  )}
                </div>
              )}
              {(request.estado === "rechazada" || request.estado === "cancelada") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 h-8"
                  onClick={() => updateStatus(request.id, "pendiente")}
                >
                  <Clock size={14} className="mr-1" /> Reactivar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return <ReceivedSkeleton />;
  }

  if (solicitudesRecibidas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
          <MessageSquare size={32} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">No tienes solicitudes</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Cuando alguien se postule a tus servicios u oportunidades, podrás ver las solicitudes aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECCIÓN 1: Oportunidades */}
      {groupedRequests.oportunidades.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <Briefcase size={20} className="text-purple-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-700">Oportunidades</h2>
              <p className="text-xs text-slate-500">
                Personas que se postularon a tus oportunidades publicadas
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-0 ml-auto font-semibold">
              {groupedRequests.oportunidades.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {groupedRequests.oportunidades.map((request) => (
              <ReceivedRequestCard key={request.id} request={request} />
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN 2: Servicios */}
      {groupedRequests.servicios.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <Users size={20} className="text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-700">Servicios</h2>
              <p className="text-xs text-slate-500">
                Clientes que solicitaron contratar tus servicios
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-0 ml-auto font-semibold">
              {groupedRequests.servicios.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {groupedRequests.servicios.map((request) => (
              <ReceivedRequestCard key={request.id} request={request} />
            ))}
          </div>
        </section>
      )}

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRatingService(null);
        }}
        onSubmit={async ({ ratingUsuario, ratingServicio, comment }) => {
          setRatingLoading(true);
          try {
            const response = await fetch(`${API_URL}/resenas`, {
              method: "POST",
              headers: authHeaders(true),
              body: JSON.stringify({
                id_Postulacion: ratingService?.id_Postulacion,
                id_Servicio: ratingService?.id_Servicio,
                calificacion_usuario: ratingUsuario,
                calificacion_servicio: ratingServicio,
                comentario: comment || "",
              }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || "Error al calificar.");
            setSolicitudesRecibidas((prev) =>
              prev.map((s) =>
                s.id === ratingService?.id_Postulacion ? { ...s, ya_califico_receptor: true } : s
              )
            );
            setShowRatingModal(false);
            setRatingService(null);
            showSuccess("¡Gracias!", "Tu calificación ha sido registrada.");
          } catch (error) {
            showError("Error", error.message);
          } finally {
            setRatingLoading(false);
          }
        }}
        subtitle={`¿Cómo fue tu experiencia con ${ratingService?.servicio?.titulo || "este usuario"}?`}
        tipo={ratingService?.tipo || "servicio"}
        rolCalificado={ratingService?.rolCalificado || "ofertante"}
        usuarioCalificador={currentUserEmail}
        usuarioCalificado={ratingService?.usuarioCalificado}
        loading={ratingLoading}
      />
    </div>
  );
}
