import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Loader2, 
  MessageSquare,
  Send,
  User, 
  XCircle,
  Briefcase,
  FileCheck,
  Star
} from "lucide-react";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function Applications({ defaultTab }) {
  const [applications, setApplications] = useState([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el chat de postulaciones recibidas
  const [selectedPostulacion, setSelectedPostulacion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // Determinar la pestaña inicial basada en defaultTab
  const getInitialTab = () => {
    if (defaultTab === "received") return "received";
    return "sent";
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);

  const authHeaders = (json = false) => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchApplications(),
        fetchSolicitudesRecibidas()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/postulaciones`, { headers: authHeaders() });
      if (!response.ok) throw new Error("No se pudo cargar postulaciones.");
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error de conexion");
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

  const openPublicProfile = (idCorreo) => {
    if (!idCorreo) return;
    localStorage.setItem("profile_target_user", idCorreo);
    localStorage.setItem("currentView", "public_profile");
    window.location.reload();
  };

  // Funciones para messaging en postulaciones recibidas
  const openChat = async (postulacion) => {
    setSelectedPostulacion(postulacion);
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}/postulaciones/${postulacion.id}/mensajes`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.mensajes || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedPostulacion || !newMessage.trim()) return;
    try {
      const res = await fetch(`${API_URL}/postulaciones/${selectedPostulacion.id}/mensajes`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ mensaje: newMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo enviar el mensaje.");
      setNewMessage("");
      openChat(selectedPostulacion);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const updateStatus = async (postulacionId, newStatus) => {
    const confirmMessages = {
      aceptada: "¿Aceptar esta postulación? El postulante será notificado.",
      rechazada: "¿Rechazar esta postulación? El postulante será notificado.",
      en_progreso: "¿Iniciar el trabajo con este postulante?"
    };

    const result = await Swal.fire({
      title: newStatus === "aceptada" ? "Aceptar Postulación" : 
             newStatus === "rechazada" ? "Rechazar Postulación" : "Iniciar Trabajo",
      text: confirmMessages[newStatus],
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/servicios/solicitudes/${postulacionId}/estado`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ estado: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo actualizar el estado.");

      Swal.fire({
        icon: "success",
        title: newStatus === "aceptada" ? "Postulación aceptada" : 
               newStatus === "rechazada" ? "Postulación rechazada" : "Trabajo iniciado",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchSolicitudesRecibidas();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const cancelProposal = async (application) => {
    const result = await Swal.fire({
      title: "Cancelar postulación",
      text: "La propuesta pasará a estado cancelada.",
      showCancelButton: true,
      confirmButtonText: "Cancelar postulación",
    });
    if (!result.isConfirmed) return;
    
    const response = await fetch(`${API_URL}/postulaciones/${application.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return Swal.fire("Error", data?.message || "No se pudo cancelar.", "error");
    Swal.fire("Listo", "Postulación cancelada.", "success");
    fetchApplications();
  };

  // Filtrar aplicaciones por estado
  const pending = applications.filter((a) => a.estado === "pendiente");
  const accepted = applications.filter((a) => a.estado === "aceptada");
  const inProgress = applications.filter((a) => a.estado === "en_progreso");
  const completed = applications.filter((a) => a.estado === "completada");
  const paid = applications.filter((a) => a.estado === "pagada");
  const rejected = applications.filter((a) => a.estado === "rechazada");
  const canceled = applications.filter((a) => a.estado === "cancelada");

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendiente: { bg: "bg-amber-500", icon: Clock, label: "Pendiente" },
      aceptada: { bg: "bg-emerald-500", icon: CheckCircle, label: "Aceptada" },
      en_progreso: { bg: "bg-blue-500", icon: Clock, label: "En Progreso" },
      completada: { bg: "bg-purple-500", icon: CheckCircle, label: "Completada" },
      pagada: { bg: "bg-green-500", icon: DollarSign, label: "Pagada" },
      rechazada: { bg: "bg-red-500", icon: XCircle, label: "Rechazada" },
      cancelada: { bg: "bg-slate-500", icon: XCircle, label: "Cancelada" },
    };
    const config = statusConfig[status] || { bg: "bg-slate-500", icon: Clock, label: status };
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.bg} text-white border-0 px-2 py-0.5 text-xs`}>
        <Icon size={12} className="inline mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: "border-l-amber-500",
      aceptada: "border-l-emerald-500",
      en_progreso: "border-l-blue-500",
      completada: "border-l-purple-500",
      pagada: "border-l-green-500",
      rechazada: "border-l-red-500",
      cancelada: "border-l-slate-500",
    };
    return colors[status] || "border-l-gray-300";
  };

  // Componente Card para postulación enviada
  const ApplicationCard = ({ application }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${getStatusColor(application.estado)} overflow-hidden hover:shadow-lg transition-shadow`}>
      <div className="grid md:grid-cols-[180px_1fr] gap-5">
        <div className="h-44 md:h-auto relative">
          <ImageWithFallback 
            src={resolveImageUrl(application.servicio?.imagen)} 
            alt={application.servicio?.titulo || "Servicio"} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute top-3 right-3">
            {getStatusBadge(application.estado)}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">
            {application.servicio?.titulo}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-4">
            {application.servicio?.descripcion}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <User size={14} className="text-blue-500" />
              <button 
                onClick={() => openPublicProfile(application.servicio?.cliente_usuario?.id_CorreoUsuario)} 
                className="text-blue-600 hover:underline truncate"
              >
                {application.servicio?.cliente_usuario?.nombre || "Cliente"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-500" />
              <span className="text-slate-600">
                ${Number(application.servicio?.precio || 0).toLocaleString("es-CO")}
              </span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Calendar size={14} className="text-indigo-500" />
              <span className="text-slate-500 text-xs">
                {application.created_at ? new Date(application.created_at).toLocaleDateString("es-CO") : "Fecha no disponible"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {application.estado === "pendiente" && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => cancelProposal(application)}
              >
                <XCircle size={14} className="mr-1" /> Cancelar
              </Button>
            )}
            {application.estado === "aceptada" && (
              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                <CheckCircle size={12} className="mr-1" /> Aceptado
              </Badge>
            )}
            {application.estado === "en_progreso" && (
              <Badge className="bg-blue-100 text-blue-700 border-0">
                <Briefcase size={12} className="mr-1" /> En Progreso
              </Badge>
            )}
            {application.estado === "completada" && (
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-purple-100 text-purple-700 border-0">
                  <FileCheck size={12} className="mr-1" /> Completada - Esperando pago
                </Badge>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={async () => {
                    try {
                      const response = await fetch(`${API_URL}/postulaciones/${application.id}/cobrar`, {
                        method: "POST",
                        headers: authHeaders(),
                      });
                      const data = await response.json();
                      if (!response.ok) throw new Error(data?.message || "Error al cobrar.");
                      fetchApplications();
                      Swal.fire('¡Cobrado!', 'El pago ha sido cobrado exitosamente.', 'success');
                    } catch (error) {
                      Swal.fire('Error', error.message, 'error');
                    }
                  }}
                >
                  <DollarSign size={14} className="mr-1" /> Cobrar
                </Button>
              </div>
            )}
            {application.estado === "pagada" && (
              <Badge className="bg-green-500 text-white border-0">
                <DollarSign size={12} className="mr-1" /> Pagada
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Card para solicitud recibida
  const ReceivedRequestCard = ({ request }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${getStatusColor(request.estado)} overflow-hidden hover:shadow-lg transition-shadow`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
              {request?.servicio?.titulo || "Servicio"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Postulante: {request?.usuario?.nombre || "Usuario"} {request?.usuario?.apellido || ""}
            </p>
          </div>
          {getStatusBadge(request.estado)}
        </div>

        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 mb-4 min-h-[60px]">
          {request.mensaje || "Sin mensaje."}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {request.created_at ? new Date(request.created_at).toLocaleString("es-CO") : "Fecha no disponible"}
          </p>
          <div className="flex gap-2 flex-wrap">
            {request.estado === "pendiente" && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => updateStatus(request.id, "aceptada")}
                >
                  <CheckCircle size={14} className="mr-1" /> Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => updateStatus(request.id, "rechazada")}
                >
                  <XCircle size={14} className="mr-1" /> Rechazar
                </Button>
              </>
            )}
            {request.estado === "aceptada" && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => updateStatus(request.id, "en_progreso")}
              >
                ▶ Iniciar Trabajo
              </Button>
            )}
            {request.estado === "en_progreso" && (
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={async () => {
                  const confirm = await Swal.fire({
                    title: '¿Marcar trabajo como completado?',
                    text: 'Esto habilitará el pago del servicio.',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, está completado',
                    cancelButtonText: 'Cancelar',
                  });
                  if (!confirm.isConfirmed) return;
                  try {
                    const response = await fetch(`${API_URL}/postulaciones/${request.id}/completar`, {
                      method: "PATCH",
                      headers: authHeaders(true),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data?.message || "Error al marcar como completado.");
                    fetchSolicitudesRecibidas();
                    Swal.fire('¡Completado!', 'El trabajo ha sido marcado como completado.', 'success');
                  } catch (error) {
                    Swal.fire('Error', error.message, 'error');
                  }
                }}
              >
                ✓ Marcar Completado
              </Button>
            )}
            {request.estado === "completada" && (
              <div className="flex gap-2 flex-wrap items-center">
                <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1">
                  ✅ Listo para pago
                </Badge>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={async () => {
                    const confirm = await Swal.fire({
                      title: '¿Proceder con el pago?',
                      text: 'Se procesará el pago del servicio.',
                      icon: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Sí, pagar',
                      cancelButtonText: 'Cancelar',
                    });
                    if (!confirm.isConfirmed) return;
                    try {
                      const response = await fetch(`${API_URL}/pagos/servicio`, {
                        method: "POST",
                        headers: authHeaders(true),
                        body: JSON.stringify({
                          id_Servicio: request.servicio.id_Servicio,
                          modalidadPago: 'virtual',
                          modalidadServicio: 'presencial',
                          identificacionCliente: '12345678',
                          origenSolicitud: 'postulacion',
                          id_Postulacion: request.id,
                          monto: request.servicio.precio || 0
                        }),
                      });
                      const data = await response.json();
                      if (!response.ok) throw new Error(data?.message || "Error al procesar el pago.");
                      fetchSolicitudesRecibidas();
                      Swal.fire('¡Pago exitoso!', 'El pago ha sido procesado.', 'success');
                    } catch (error) {
                      Swal.fire('Error', error.message, 'error');
                    }
                  }}
                >
                  <DollarSign size={14} className="mr-1" /> Pagar
                </Button>
              </div>
            )}
            {request.estado === "pagada" && (
              <div className="flex gap-2 flex-wrap items-center">
                <Badge className="bg-green-500 text-white border-0 px-3 py-1">
                  ✅ Pagada
                </Badge>
                <Button
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={async () => {
                    const { value: rating } = await Swal.fire({
                      title: 'Califica el servicio',
                      input: 'range',
                      inputLabel: 'Calificación (1-5 estrellas)',
                      inputAttributes: {
                        min: 1,
                        max: 5,
                        step: 1
                      },
                      inputValue: 5,
                      showCancelButton: true,
                      confirmButtonText: 'Calificar',
                      cancelButtonText: 'Cancelar',
                    });
                    
                    if (!rating) return;
                    
                    const { value: comment } = await Swal.fire({
                      title: 'Deja un comentario (opcional)',
                      input: 'textarea',
                      inputPlaceholder: 'Escribe tu experiencia con el servicio...',
                      showCancelButton: true,
                      confirmButtonText: 'Enviar',
                      cancelButtonText: 'Cancelar',
                    });
                    
                    try {
                      const response = await fetch(`${API_URL}/resenas`, {
                        method: "POST",
                        headers: authHeaders(true),
                        body: JSON.stringify({
                          id_Servicio: request.servicio.id_Servicio,
                          calificacion: parseInt(rating),
                          comentario: comment || ''
                        }),
                      });
                      const data = await response.json();
                      if (!response.ok) throw new Error(data?.message || "Error al calificar.");
                      fetchSolicitudesRecibidas();
                      Swal.fire('¡Gracias!', 'Tu calificación ha sido registrada.', 'success');
                    } catch (error) {
                      Swal.fire('Error', error.message, 'error');
                    }
                  }}
                >
                  <Star size={14} className="mr-1" /> Calificar
                </Button>
              </div>
            )}
            {(request.estado === "rechazada" || request.estado === "cancelada") && (
              <Button
                size="sm"
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => updateStatus(request.id, "pendiente")}
              >
                <Clock size={14} className="mr-1" /> Volver a Pendiente
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-200">
            <Briefcase className="text-white h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mis Postulaciones</h1>
            <p className="text-slate-500 font-medium">Gestiona tus postulaciones y solicitudes recibidas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl h-12 mb-8">
          <TabsTrigger 
            value="sent" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 text-sm font-medium"
          >
            📤 Mis Postulaciones Enviadas ({applications.length})
          </TabsTrigger>
          <TabsTrigger 
            value="received" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 text-sm font-medium"
          >
            📥 Solicitudes Recibidas ({solicitudesRecibidas.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Mis Postulaciones Enviadas */}
        <TabsContent value="sent" className="space-y-4">
          {/* Sub-filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              Todas ({applications.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Pendientes ({pending.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Aceptadas ({accepted.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              En Progreso ({inProgress.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              Completadas ({completed.length})
            </Button>
          </div>

          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <Send size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes postulaciones</h3>
              <p className="text-slate-500 max-w-md">
                Explora las oportunidades disponibles y postula a los servicios que te interesen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Solicitudes Recibidas */}
        <TabsContent value="received" className="space-y-4">
          {solicitudesRecibidas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <MessageSquare size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes solicitudes</h3>
              <p className="text-slate-500 max-w-md">
                Cuando alguien se postule a tus servicios, podrás ver las solicitudes aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {solicitudesRecibidas.map((request) => (
                <ReceivedRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
