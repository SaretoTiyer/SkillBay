import { useEffect, useState } from "react";
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
  FileCheck
} from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/Button";

export default function ReceivedApplications() {
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el chat de postulaciones recibidas
  const [selectedPostulacion, setSelectedPostulacion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");

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
      await fetchSolicitudesRecibidas();
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

  /**
   * Determina el tipo de solicitud usando el campo `servicio.tipo`.
   * - 'oportunidad': el usuario publicó una necesidad y alguien se postula a cubrirla
   *   → sección "Aceptar Postulante"
   * - 'servicio': el usuario publicó un servicio y alguien lo solicita
   *   → sección "Aceptar Cliente"
   *
   * CORRECCIÓN: antes se comparaba currentUserEmail con servicio.id_Cliente,
   * pero el endpoint /servicios/solicitudes ya filtra por id_Cliente del usuario
   * autenticado, haciendo que esa comparación siempre fuera verdadera.
   */
  const getRequestType = (request) => {
    return request?.servicio?.tipo === 'servicio' ? 'servicio' : 'oportunidad';
  };

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

  // Componente Card para solicitud recibida
  const ReceivedRequestCard = ({ request }) => {
    const requestType = getRequestType(request);
    
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${getStatusColor(request.estado)} overflow-hidden hover:shadow-lg transition-shadow`}>
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {requestType === 'servicio' ? (
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                    <Users size={12} className="mr-1" /> Solicitud de Servicio
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                    <Briefcase size={12} className="mr-1" /> Solicitud de Oportunidad
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                {request?.servicio?.titulo || "Servicio"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {requestType === 'servicio' ? 'Cliente: ' : 'Postulante: '}
                {request?.usuario?.nombre || "Usuario"} {request?.usuario?.apellido || ""}
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
                requestType === 'oportunidad' ? (
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={async () => {
                      const confirm = await Swal.fire({
                        title: '¿Marcar trabajo como completado?',
                        text: 'Confirmas que el trabajo fue realizado correctamente.',
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
                        Swal.fire('¡Completado!', 'El trabajo ha sido marcado como completado. El cliente será notificado para realizar el pago.', 'success');
                      } catch (error) {
                        Swal.fire('Error', error.message, 'error');
                      }
                    }}
                  >
                    ✓ Marcar Completado
                  </Button>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 border-0 px-3 py-1">
                    <Briefcase size={12} className="mr-1" /> Trabajo en progreso — esperando confirmación del cliente
                  </Badge>
                )
              )}
              {request.estado === "completada" && (
                requestType === 'oportunidad' ? (
                  <div className="flex gap-2 flex-wrap items-center">
                    <Badge className="bg-purple-100 text-purple-700 border-0 px-3 py-1">
                      <FileCheck size={12} className="mr-1" /> Trabajo completado — Realiza el pago
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={async () => {
                        const confirm = await Swal.fire({
                          title: '¿Pagar al postulante?',
                          text: 'El pago será realizado al postulante que completó el trabajo.',
                          icon: 'question',
                          showCancelButton: true,
                          confirmButtonText: 'Sí, pagar al postulante',
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
                              monto: request.presupuesto || request.servicio?.precio || 0
                            }),
                          });
                          const data = await response.json();
                          if (!response.ok) throw new Error(data?.message || "Error al procesar el pago.");
                          fetchSolicitudesRecibidas();
                          Swal.fire('¡Pago exitoso!', 'El pago ha sido procesado y el postulante será notificado.', 'success');
                        } catch (error) {
                          Swal.fire('Error', error.message, 'error');
                        }
                      }}
                    >
                      <DollarSign size={14} className="mr-1" /> Pagar al postulante
                    </Button>
                  </div>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-0 px-3 py-1">
                    ⏳ Esperando pago del cliente
                  </Badge>
                )
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Separar solicitudes en dos grupos según el tipo del servicio asociado:
  // - solicitudesOportunidad: alguien se postuló a una oportunidad publicada por el usuario
  // - solicitudesServicio: alguien solicitó un servicio publicado por el usuario
  const solicitudesOportunidad = solicitudesRecibidas.filter(
    (r) => r?.servicio?.tipo !== 'servicio'
  );
  const solicitudesServicio = solicitudesRecibidas.filter(
    (r) => r?.servicio?.tipo === 'servicio'
  );

  if (solicitudesRecibidas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
        <div className="bg-white p-6 rounded-full shadow-sm mb-6">
          <MessageSquare size={48} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes solicitudes</h3>
        <p className="text-slate-500 max-w-md">
          Cuando alguien se postule a tus servicios u oportunidades, podrás ver las solicitudes aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECCIÓN 1: Aceptar Postulante — alguien se postuló a una oportunidad del usuario */}
      {solicitudesOportunidad.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Briefcase size={20} className="text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-700">Aceptar Postulante</h2>
              <p className="text-xs text-slate-500">
                Personas que se postularon a tus oportunidades publicadas
              </p>
            </div>
            <Badge className="bg-purple-100 text-blue-700 border-0 ml-auto">
              {solicitudesOportunidad.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {solicitudesOportunidad.map((request) => (
              <ReceivedRequestCard key={request.id} request={request} />
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN 2: Aceptar Cliente — alguien solicitó un servicio del usuario */}
      {solicitudesServicio.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Users size={20} className="text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-700">Aceptar Cliente</h2>
              <p className="text-xs text-slate-500">
                Clientes que solicitaron contratar tus servicios
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-0 ml-auto">
              {solicitudesServicio.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {solicitudesServicio.map((request) => (
              <ReceivedRequestCard key={request.id} request={request} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
