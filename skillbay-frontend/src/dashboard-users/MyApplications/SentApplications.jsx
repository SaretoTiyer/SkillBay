import { useEffect, useState } from "react";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Loader2, 
  Send,
  User,
  XCircle,
  Briefcase,
  FileCheck
} from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";
import { resolveImageUrl } from "../../utils/image";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/Button";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export default function SentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [filter, setFilter] = useState("all");

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
        fetchCurrentUser()
      ]);
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
      setError(err.message || "Error de conexion");
    }
  };

  // Función para determinar el rol del usuario en la relación
  const getUserRole = (application) => {
    if (!currentUserEmail || !application.servicio) return 'Postulador';
    
    // El cliente del servicio es quien creó la oportunidad/servicio
    const clienteEmail = application.servicio.id_Cliente;
    
    if (currentUserEmail === clienteEmail) {
      return 'Solicitante';  // El que publicó la oportunidad
    }
    return 'Postulador';     // El que respondió a la oportunidad
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

  // ============================================
  // CONFIGURACIÓN CENTRALIZADA DE ESTADOS
  // ============================================
  const ESTADOS = {
    pendiente: { label: 'Pendientes', color: 'amber', key: 'pendiente' },
    aceptada: { label: 'Aceptadas', color: 'emerald', key: 'aceptada' },
    en_progreso: { label: 'En Progreso', color: 'blue', key: 'en_progreso' },
    completada: { label: 'Completadas', color: 'purple', key: 'completada' },
    pagada: { label: 'Pagadas', color: 'green', key: 'pagada' },
    rechazada: { label: 'Rechazadas', color: 'red', key: 'rechazada' },
    cancelada: { label: 'Canceladas', color: 'slate', key: 'cancelada' },
  };

  // Función reutilizable para filtrar por estado
  const filterByEstado = (apps, estado) => apps.filter((a) => a.estado === estado);

  // Función reutilizable para obtener conteos
  const getCounts = (apps) => {
    const counts = {};
    Object.keys(ESTADOS).forEach((key) => {
      counts[key] = filterByEstado(apps, key).length;
    });
    return counts;
  };

  // Obtener aplicaciones filtradas según el estado seleccionado
  const filteredApplications = filter === 'all' 
    ? applications 
    : filterByEstado(applications, filter);

  // Calcular conteos
  const counts = getCounts(applications);

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
              <span className="text-slate-400 text-xs">Rol:</span>
              <span className={`font-medium text-xs ${currentUserEmail === application.servicio?.id_Cliente ? 'text-amber-600' : 'text-blue-600'}`}>
                {getUserRole(application)}
              </span>
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
            {application.estado === "completada" && application.tipo_postulacion === 'solicitante' && (
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-purple-100 text-purple-700 border-0">
                  <FileCheck size={12} className="mr-1" /> Trabajo completado - Paga al proveedor
                </Badge>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={async () => {
                    const confirm = await Swal.fire({
                      title: '¿Proceder con el pago?',
                      text: 'El pago será realizado al proveedor/prestador del servicio.',
                      icon: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Sí, pagar al proveedor',
                      cancelButtonText: 'Cancelar',
                    });
                    if (!confirm.isConfirmed) return;
                    try {
                      const response = await fetch(`${API_URL}/pagos/servicio`, {
                        method: "POST",
                        headers: authHeaders(true),
                        body: JSON.stringify({
                          id_Servicio: application.servicio.id_Servicio,
                          modalidadPago: 'virtual',
                          modalidadServicio: 'presencial',
                          identificacionCliente: '12345678',
                          origenSolicitud: 'postulacion',
                          id_Postulacion: application.id,
                          monto: application.servicio.precio || 0
                        }),
                      });
                      const data = await response.json();
                      if (!response.ok) throw new Error(data?.message || "Error al procesar el pago.");
                      fetchApplications();
                      Swal.fire('¡Pago exitoso!', 'El pago ha sido procesado y el proveedor será notificado.', 'success');
                    } catch (error) {
                      Swal.fire('Error', error.message, 'error');
                    }
                  }}
                >
                  <DollarSign size={14} className="mr-1" /> Pagar al proveedor
                </Button>
              </div>
            )}
            {application.estado === "completada" && application.tipo_postulacion === 'postulante' && (
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-amber-100 text-amber-700 border-0">
                  <Clock size={12} className="mr-1" /> Esperando que el cliente complete el pago
                </Badge>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sub-filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setFilter("all")}
        >
          Todas ({applications.length})
        </Button>
        {Object.entries(ESTADOS).map(([key, config]) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setFilter(key)}
          >
            {config.label} ({counts[key]})
          </Button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <div className="bg-white p-6 rounded-full shadow-sm mb-6">
            <Send size={48} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{filter === 'all' ? 'No tienes solicitudes enviadas' : 'No hay solicitudes con este estado'}</h3>
          <p className="text-slate-500 max-w-md">
            {filter === 'all' ? 'Explora las oportunidades disponibles y postula a los servicios que te interesen.' : 'Prueba seleccionando otro filtro o explorando más servicios.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}
