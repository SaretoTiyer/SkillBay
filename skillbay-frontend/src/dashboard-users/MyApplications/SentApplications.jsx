import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  Send,
  Star,
  User,
  XCircle,
  Briefcase,
  FileCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import { showSuccess, showError, showConfirm } from "../../utils/swalHelpers";
import { API_URL } from "../../config/api";
import { getServiceImage } from "../../utils/serviceImages";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/Button";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import RatingModal from "../../components/RatingModal";
import PaymentCheckoutModal from "../../components/PaymentCheckoutModal";
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

const ACTIVE_STATES = ["pendiente", "aceptada", "en_progreso", "completada", "pagada"];
const HISTORY_STATES = ["rechazada", "cancelada"];

// ============================================
// SKELETON
// ============================================

function ApplicationsSkeleton() {
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
// MAIN COMPONENT
// ============================================

export default function SentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
  const [paymentPostulacion, setPaymentPostulacion] = useState(null);
  const [filter, setFilter] = useState("active"); // "active" by default, not "all"
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  const authHeaders = (json = false) => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchApplications(), fetchCurrentUser()]);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/postulaciones`, { headers: authHeaders() });
      if (!response.ok) throw new Error("No se pudo cargar postulaciones.");
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const cancelProposal = async (application) => {
    const result = await showConfirm(
      "Cancelar postulación",
      "La propuesta pasará a estado cancelada.",
      "Cancelar postulación"
    );
    if (!result.isConfirmed) return;

    const response = await fetch(`${API_URL}/postulaciones/${application.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return showError("Error", data?.message || "No se pudo cancelar.");
    showSuccess("Listo", "Postulación cancelada.");
    fetchApplications();
  };

  // ============================================
  // FILTERING
  // ============================================

  const activeApplications = useMemo(
    () => applications.filter((a) => ACTIVE_STATES.includes(a.estado)),
    [applications]
  );

  const historyApplications = useMemo(
    () => applications.filter((a) => HISTORY_STATES.includes(a.estado)),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    if (filter === "active") return activeApplications;
    if (filter === "history") return historyApplications;
    if (filter === "all") return applications;
    return applications.filter((a) => a.estado === filter);
  }, [filter, applications, activeApplications, historyApplications]);

  const counts = useMemo(() => {
    const c = { all: applications.length, active: 0, history: 0 };
    applications.forEach((a) => {
      if (ACTIVE_STATES.includes(a.estado)) c.active++;
      if (HISTORY_STATES.includes(a.estado)) c.history++;
    });
    Object.keys(STATUS_CONFIG).forEach((key) => {
      c[key] = applications.filter((a) => a.estado === key).length;
    });
    return c;
  }, [applications]);

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

  const getUserInfo = useCallback(
    (application) => {
      if (!application.servicio) {
        return <span className="text-blue-600 text-xs">Postulador</span>;
      }

      const clienteDelServicio = application.servicio.cliente_usuario;
      const nombreCliente = clienteDelServicio
        ? `${clienteDelServicio.nombre || ""} ${clienteDelServicio.apellido || ""}`.trim()
        : application.servicio.id_Dueno || "Cliente";

      const tipoPostulacion = application.tipo_postulacion || "postulante";

      if (tipoPostulacion === "solicitante") {
        return (
          <span className="text-xs">
            <span className="text-amber-600 font-medium">{nombreCliente}</span>
            <span className="text-slate-400"> (Ofertante)</span>
          </span>
        );
      }
      return (
        <span className="text-xs">
          <span className="text-blue-600 font-medium">{nombreCliente}</span>
          <span className="text-slate-400"> (Cliente)</span>
        </span>
      );
    },
    []
  );

  // ============================================
  // APPLICATION CARD (COMPACT DESIGN)
  // ============================================

  const ApplicationCard = ({ application, isHistory = false }) => (
    <div
      className={`bg-white rounded-2xl border border-gray-100 border-l-4 shadow-sm transition-all ${
        STATUS_CONFIG[application.estado]?.border || "border-l-gray-300"
      } ${isHistory ? "opacity-60 hover:opacity-80" : "hover:shadow-md"}`}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Service Image Thumbnail */}
        <div className="relative w-full sm:w-24 h-20 sm:h-auto shrink-0 rounded-xl overflow-hidden">
          <ImageWithFallback
            src={getServiceImage(application.servicio)}
            alt={application.servicio?.titulo || "Servicio"}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-800 truncate">
                {application.servicio?.titulo}
              </h3>
              <p className="text-sm text-slate-500 truncate">
                {application.servicio?.descripcion}
              </p>
            </div>
            <div className="shrink-0">{getStatusBadge(application.estado)}</div>
          </div>

          {/* Info Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-2">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-blue-500" />
              <span className="text-slate-400">:</span>
              {getUserInfo(application)}
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign size={12} className="text-emerald-500" />
              <span className="text-slate-600 font-medium">
                ${Number(application.servicio?.precio || 0).toLocaleString("es-CO")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-indigo-500" />
              <span className="text-slate-500">
                {application.created_at
                  ? new Date(application.created_at).toLocaleDateString("es-CO")
                  : "—"}
              </span>
            </div>
          </div>

          {/* Collapsible Message */}
          {application.mensaje && <CollapsibleMessage message={application.mensaje} />}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100">
            {!isHistory && application.estado === "pendiente" && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 h-8"
                onClick={() => cancelProposal(application)}
              >
                <XCircle size={14} className="mr-1" /> Cancelar
              </Button>
            )}
            {application.estado === "aceptada" && !isHistory && (
              <Badge className="bg-emerald-100 text-emerald-700 border-0 h-7">
                <CheckCircle size={12} className="mr-1" /> Aceptado
              </Badge>
            )}
            {application.estado === "en_progreso" && !isHistory && (
              application.tipo_postulacion === "solicitante" ? (
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-blue-100 text-blue-700 border-0 h-7">
                    <Briefcase size={12} className="mr-1" /> En Progreso
                  </Badge>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white h-8"
                    onClick={async () => {
                      const confirm = await showConfirm(
                        "¿Marcar trabajo como completado?",
                        "Esto notificará al ofertante para que espere el pago.",
                        "Sí, está completado"
                      );
                      if (!confirm.isConfirmed) return;
                      try {
                        const response = await fetch(
                          `${API_URL}/postulaciones/${application.id}/completar`,
                          {
                            method: "PATCH",
                            headers: authHeaders(true),
                          }
                        );
                        const data = await response.json();
                        if (!response.ok)
                          throw new Error(data?.message || "Error al marcar como completado.");
                        fetchApplications();
                        showSuccess(
                          "¡Completado!",
                          "El trabajo ha sido marcado como completado. El ofertante será notificado."
                        );
                      } catch (error) {
                        showError("Error", error.message);
                      }
                    }}
                  >
                    <FileCheck size={14} className="mr-1" /> Completado
                  </Button>
                </div>
              ) : (
                <Badge className="bg-blue-100 text-blue-700 border-0 h-7">
                  <Briefcase size={12} className="mr-1" /> En Progreso
                </Badge>
              )
            )}
            {application.estado === "completada" && application.tipo_postulacion === "solicitante" && !isHistory && (
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-purple-100 text-purple-700 border-0 h-7">
                  <FileCheck size={12} className="mr-1" /> Esperando pago
                </Badge>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                  onClick={() => {
                    setPaymentPostulacion(application);
                    setShowPaymentCheckout(true);
                  }}
                >
                  <DollarSign size={14} className="mr-1" /> Pagar
                </Button>
              </div>
            )}
            {application.estado === "completada" && application.tipo_postulacion === "postulante" && !isHistory && (
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-amber-100 text-amber-700 border-0 h-7">
                  <Clock size={12} className="mr-1" /> Esperando pago del cliente
                </Badge>
              </div>
            )}
            {application.estado === "pagada" && !isHistory && (
              <div className="flex gap-2 flex-wrap items-center">
                <Badge className="bg-green-500 text-white border-0 h-7">
                  <DollarSign size={12} className="mr-1" /> Pagada
                </Badge>
                {application.tipo_postulacion === "solicitante" && (
                  <>
                    {application.ya_califico ? (
                      <Badge className="bg-slate-200 text-slate-600 border-0 h-7 px-3">
                        <Star size={12} className="mr-1" /> Calificado
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white h-8"
                        onClick={() => {
                          const contexto = determinarContextoCalificacion(
                            application.servicio?.tipo || "servicio",
                            currentUserEmail,
                            application.servicio?.id_Dueno,
                            application.usuario?.id_CorreoUsuario
                          );

                          if (contexto.error) {
                            showError("Error", contexto.error);
                            return;
                          }

                          setRatingData({
                            id_Servicio: application.servicio.id_Servicio,
                            id_Postulacion: application.id,
                            tipo: application.servicio?.tipo || "servicio",
                            servicio: application.servicio,
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
                  </>
                )}
              </div>
            )}
            {isHistory && (
              <span className="text-xs text-gray-400 italic flex items-center gap-1 h-8">
                <Clock size={12} />
                Sin acciones disponibles
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return <ApplicationsSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Compact Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("active")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filter === "active"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle size={12} />
            Activas
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
              {counts.active}
            </span>
          </span>
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Send size={12} />
            Todas
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
              {counts.all}
            </span>
          </span>
        </button>

        {/* Collapsible History Toggle */}
        {counts.history > 0 && (
          <button
            onClick={() => {
              if (filter === "history") {
                setFilter("active");
              } else {
                setFilter("history");
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === "history"
                ? "bg-red-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {filter === "history" ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
              Historial
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                {counts.history}
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
          <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
            <Send size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            {filter === "active"
              ? "No hay solicitudes activas"
              : filter === "history"
              ? "No hay historial"
              : "No tienes solicitudes enviadas"}
          </h3>
          <p className="text-slate-500 text-sm max-w-xs">
            {filter === "active"
              ? "Explora las oportunidades disponibles y postula a los servicios que te interesen."
              : filter === "history"
              ? "¡Genial! No tienes postulaciones rechazadas ni canceladas."
              : "Prueba seleccionando otro filtro o explorando más servicios."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              isHistory={HISTORY_STATES.includes(application.estado)}
            />
          ))}
        </div>
      )}

      {/* Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={showPaymentCheckout}
        onClose={() => { setShowPaymentCheckout(false); setPaymentPostulacion(null); }}
        service={paymentPostulacion?.servicio}
        postulacionId={paymentPostulacion?.id}
        monto={paymentPostulacion?.presupuesto || paymentPostulacion?.servicio?.precio || 0}
        authHeaders={authHeaders}
        onPaymentSuccess={async () => {
          await fetchApplications();
        }}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRatingData(null);
        }}
        onSubmit={async ({ ratingUsuario, ratingServicio, comment }) => {
          setRatingLoading(true);
          try {
            const response = await fetch(`${API_URL}/resenas`, {
              method: "POST",
              headers: authHeaders(true),
              body: JSON.stringify({
                id_Postulacion: ratingData?.id_Postulacion,
                id_Servicio: ratingData?.id_Servicio,
                calificacion_usuario: ratingUsuario,
                calificacion_servicio: ratingServicio,
                comentario: comment || "",
              }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || "Error al calificar.");
            setApplications((prev) =>
              prev.map((a) =>
                a.id === ratingData?.id_Postulacion ? { ...a, ya_califico: true } : a
              )
            );
            setShowRatingModal(false);
            setRatingData(null);
            showSuccess("¡Gracias!", "Tu calificación ha sido registrada.");
          } catch (error) {
            showError("Error", error.message);
          } finally {
            setRatingLoading(false);
          }
        }}
        subtitle={`¿Cómo fue tu experiencia con ${
          ratingData?.servicio?.titulo || "este servicio"
        }?`}
        tipo={ratingData?.tipo || "servicio"}
        rolCalificado={ratingData?.rolCalificado || "ofertante"}
        usuarioCalificador={currentUserEmail}
        usuarioCalificado={ratingData?.usuarioCalificado}
        loading={ratingLoading}
      />
    </div>
  );
}
