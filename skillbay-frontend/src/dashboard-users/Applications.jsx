import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Loader2, 
  MessageSquare, 
  Plus, 
  Search, 
  Send,
  User, 
  XCircle,
  Briefcase,
  Target,
  Gift,
  FileCheck,
  Upload
} from "lucide-react";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [oportunidades, setOportunidades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOportunidad, setSelectedOportunidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Estado para el chat de postulaciones recibidas
  const [selectedPostulacion, setSelectedPostulacion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "{}");
    } catch {
      return {};
    }
  }, []);

  // Estados para el formulario de crear oportunidad
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    id_Categoria: "",
    grupo: "",
    tipoOportunidad: "empleo",
    requisitos: "",
    beneficios: "",
    fechaLimite: "",
    precio: "",
    tiempoEntrega: ""
  });
  const [imagen, setImagen] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [creando, setCreando] = useState(false);

  // Grupos de categorías
  const grupos = useMemo(() => {
    const gruposSet = new Set(categorias.map(c => c.grupo).filter(Boolean));
    return Array.from(gruposSet).sort();
  }, [categorias]);

  // Subcategorías del grupo seleccionado
  const subcategorias = useMemo(() => {
    if (!formData.grupo) return [];
    return categorias
      .filter(c => c.grupo === formData.grupo)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [formData.grupo, categorias]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchApplications(),
        fetchSolicitudesRecibidas(),
        fetchOportunidades(),
        fetchCategorias()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`, { headers: authHeaders() });
      if (!response.ok) return;
      const data = await response.json();
      // El backend puede devolver { categorias: [...] } o directamente un array
      const categoriasData = data.categorias || data;
      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
    } catch (err) {
      console.error("Error fetching categorias:", err);
    }
  };

  const authHeaders = (json = false) => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  });

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
      setSolicitudesRecibidas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching solicitudes:", err);
    }
  };

  const fetchOportunidades = async () => {
    try {
      const response = await fetch(`${API_URL}/servicios/explore`, { headers: authHeaders() });
      if (!response.ok) return;
      const data = await response.json();
      setOportunidades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching oportunidades:", err);
    }
  };

  const openPublicProfile = (idCorreo) => {
    if (!idCorreo) return;
    localStorage.setItem("profile_target_user", idCorreo);
    localStorage.setItem("currentView", "public_profile");
    window.location.reload();
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    // Limpiar subcategoría si cambia el grupo
    if (name === "grupo") {
      setFormData(prev => ({ ...prev, id_Categoria: "" }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    if (!formData.titulo.trim()) errors.titulo = "El título es requerido";
    if (!formData.descripcion.trim()) errors.descripcion = "La descripción es requerida";
    if (!formData.id_Categoria) errors.id_Categoria = "La categoría es requerida";
    if (!formData.grupo) errors.grupo = "El grupo es requerido";
    if (!formData.tipoOportunidad) errors.tipoOportunidad = "El tipo de oportunidad es requerido";
    if (formData.precio && isNaN(Number(formData.precio.replace(/,/g, "")))) {
      errors.precio = "El presupuesto debe ser un número válido";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Crear oportunidad
  const crearOportunidad = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire("Errores en el formulario", "Por favor completa todos los campos requeridos.", "warning");
      return;
    }

    setCreando(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.titulo.trim());
      formDataToSend.append("descripcion", formData.descripcion.trim());
      formDataToSend.append("id_Categoria", formData.id_Categoria);
      formDataToSend.append("tipo", "oportunidad");
      formDataToSend.append("estado", "Activo");
      
      if (formData.requisitos) formDataToSend.append("requisitos", formData.requisitos.trim());
      if (formData.beneficios) formDataToSend.append("beneficios", formData.beneficios.trim());
      if (formData.fechaLimite) formDataToSend.append("fecha_limite", formData.fechaLimite);
      if (formData.precio) formDataToSend.append("precio", formData.precio.replace(/,/g, ""));
      if (formData.tiempoEntrega) formDataToSend.append("tiempo_entrega", formData.tiempoEntrega);
      if (imagen) formDataToSend.append("imagen", imagen);

      const response = await fetch(`${API_URL}/servicios`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          Accept: "application/json",
        },
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || data?.errors?.titulo?.[0] || "No se pudo crear la oportunidad.");

      Swal.fire({
        icon: "success",
        title: "¡Oportunidad creada!",
        text: "Tu oportunidad ha sido publicada exitosamente.",
        timer: 2000,
        showConfirmButton: false
      });

      // Limpiar formulario
      setFormData({
        titulo: "",
        descripcion: "",
        id_Categoria: "",
        grupo: "",
        tipoOportunidad: "empleo",
        requisitos: "",
        beneficios: "",
        fechaLimite: "",
        precio: "",
        tiempoEntrega: ""
      });
      setImagen(null);
      setFormErrors({});
      
      // Recargar datos
      fetchData();
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo crear la oportunidad.", "error");
    } finally {
      setCreando(false);
    }
  };
  const submitPostulacion = async () => {
    if (!selectedOportunidad) {
      Swal.fire("Selecciona una oportunidad", "Debes seleccionar una oportunidad para postularte.", "warning");
      return;
    }

    const { value: mensaje } = await Swal.fire({
      title: "Enviar postulación",
      input: "textarea",
      inputLabel: "Mensaje de postulación",
      inputPlaceholder: "Explica por qué eres una buena opción para esta oportunidad...",
      inputAttributes: { maxlength: "2000" },
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      preConfirm: (value) => {
        const text = String(value || "").trim();
        if (!text) {
          Swal.showValidationMessage("Debes escribir un mensaje para postularte.");
          return false;
        }
        return text;
      },
    });

    if (!mensaje) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/postulaciones`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ 
          id_Servicio: selectedOportunidad.id_Servicio, 
          mensaje 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo registrar la postulación.");
      
      Swal.fire("Enviado", "Tu postulación fue enviada.", "success");
      setSelectedOportunidad(null);
      fetchApplications();
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo enviar la postulación.", "error");
    } finally {
      setSubmitting(false);
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

  const cancelProposal = async (application) => {
    const result = await Swal.fire({
      title: "Cancelar postulacion",
      text: "La propuesta pasara a estado cancelada.",
      showCancelButton: true,
      confirmButtonText: "Cancelar postulacion",
    });
    if (!result.isConfirmed) return;
    const response = await fetch(`${API_URL}/postulaciones/${application.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return Swal.fire("Error", data?.message || "No se pudo cancelar.", "error");
    Swal.fire("Listo", "Postulacion cancelada.", "success");
    fetchApplications();
  };

  // Filtrar oportunidades
  const filteredOportunidades = useMemo(() => {
    if (!searchTerm) return oportunidades;
    const term = searchTerm.toLowerCase();
    return oportunidades.filter(op => 
      op.titulo?.toLowerCase().includes(term) ||
      op.descripcion?.toLowerCase().includes(term) ||
      op.categoria?.nombre?.toLowerCase().includes(term)
    );
  }, [oportunidades, searchTerm]);

  const pending = applications.filter((a) => a.estado === "pendiente");
  const accepted = applications.filter((a) => a.estado === "aceptada");
  const inProgress = applications.filter((a) => a.estado === "en_progreso");
  const completed = applications.filter((a) => a.estado === "completada");
  const rejected = applications.filter((a) => a.estado === "rechazada");
  const canceled = applications.filter((a) => a.estado === "cancelada");

  const getStatusBadge = (status) => {
    switch (status) {
      case "pendiente":
        return <Badge className="bg-amber-500 text-white"><Clock size={14} className="inline mr-1" />Pendiente</Badge>;
      case "aceptada":
        return <Badge className="bg-emerald-500 text-white"><CheckCircle size={14} className="inline mr-1" />Aceptada</Badge>;
      case "en_progreso":
        return <Badge className="bg-blue-500 text-white"><Clock size={14} className="inline mr-1" />En Progreso</Badge>;
      case "completada":
        return <Badge className="bg-purple-500 text-white"><CheckCircle size={14} className="inline mr-1" />Completada</Badge>;
      case "rechazada":
        return <Badge className="bg-red-500 text-white"><XCircle size={14} className="inline mr-1" />Rechazada</Badge>;
      case "cancelada":
        return <Badge className="bg-slate-500 text-white"><XCircle size={14} className="inline mr-1" />Cancelada</Badge>;
      default:
        return <Badge className="bg-slate-500 text-white">{status}</Badge>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pendiente":
        return "border-l-amber-500";
      case "aceptada":
        return "border-l-emerald-500";
      case "en_progreso":
        return "border-l-blue-500";
      case "completada":
        return "border-l-purple-500";
      case "rechazada":
        return "border-l-red-500";
      case "cancelada":
        return "border-l-slate-500";
      default:
        return "border-l-gray-300";
    }
  };

  const ApplicationCard = ({ application }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${getStatusColor(application.estado)} overflow-hidden`}>
      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <div className="h-48 md:h-auto">
          <ImageWithFallback src={resolveImageUrl(application.servicio?.imagen)} alt={application.servicio?.titulo || "Servicio"} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{application.servicio?.titulo}</h3>
              <p className="text-slate-500 text-sm">{application.servicio?.descripcion}</p>
            </div>
            {getStatusBadge(application.estado)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              <button onClick={() => openPublicProfile(application.servicio?.cliente_usuario?.id_CorreoUsuario)} className="truncate text-blue-600 hover:underline">
                {application.servicio?.cliente_usuario?.nombre || "Cliente"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" />
              <span>{application.presupuesto ? `$${Number(application.presupuesto).toLocaleString("es-CO")}` : "A convenir"}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Calendar size={16} className="text-indigo-500" />
              <span>{new Date(application.created_at).toLocaleDateString("es-CO")}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><FileText size={14} /> Tu propuesta</h4>
            <p className="text-sm text-slate-600 italic">"{application.mensaje}"</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {application.estado === "pendiente" && (
              <>
                <Button variant="outline" className="border-amber-200 text-amber-700" onClick={() => cancelProposal(application)}>
                  Cancelar Postulación
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Card para postulaciones recibidas
  const ReceivedApplicationCard = ({ postulacion }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${getStatusColor(postulacion.estado)} overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {postulacion.usuario?.nombre?.[0] || "U"}{postulacion.usuario?.apellido?.[0] || ""}
            </div>
            <div>
              <p className="font-medium text-slate-800">
                {postulacion.usuario?.nombre} {postulacion.usuario?.apellido}
              </p>
              <p className="text-sm text-slate-500">{postulacion.usuario?.ciudad || "Sin ciudad"}</p>
            </div>
          </div>
          {getStatusBadge(postulacion.estado)}
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
            {postulacion.presupuesto && (
              <span className="flex items-center gap-1">
                <DollarSign size={16} className="text-emerald-500" />
                ${Number(postulacion.presupuesto).toLocaleString("es-CO")}
              </span>
            )}
            {postulacion.tiempo_estimado && (
              <span className="flex items-center gap-1">
                <Clock size={16} className="text-blue-500" />
                {postulacion.tiempo_estimado}
              </span>
            )}
            <span className="text-slate-400">
              {new Date(postulacion.created_at).toLocaleDateString("es-CO")}
            </span>
          </div>
          {postulacion.mensaje && (
            <div className="border-t border-slate-200 pt-3 mt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Mensaje de presentación</p>
              <p className="text-sm text-slate-700 italic">"{postulacion.mensaje}"</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => openPublicProfile(postulacion.id_Usuario)}>
            <User size={16} className="mr-1" /> Ver Perfil
          </Button>
          <Button variant="outline" size="sm" onClick={() => openChat(postulacion)}>
            <MessageSquare size={16} className="mr-1" /> Mensajes
          </Button>

          {postulacion.estado === "pendiente" && (
            <>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(postulacion.id, "aceptada")}>
                <CheckCircle size={16} className="mr-1" /> Aceptar
              </Button>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateStatus(postulacion.id, "rechazada")}>
                <XCircle size={16} className="mr-1" /> Rechazar
              </Button>
            </>
          )}

          {postulacion.estado === "aceptada" && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus(postulacion.id, "en_progreso")}>
              <Clock size={16} className="mr-1" /> Iniciar Trabajo
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Postulaciones</h1>
        <p className="text-slate-500 mt-1">Gestiona tus postulaciones enviadas y recibidas</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
          <div className="flex"><AlertCircle className="h-5 w-5 text-red-500" /><div className="ml-3"><p className="text-sm text-red-700">{error}</p></div></div>
        </div>
      )}

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="bg-white p-1 rounded-xl border border-slate-200 mb-8 inline-flex h-auto">
          <TabsTrigger value="sent" className="rounded-lg px-4 py-2">Mis Postulaciones Enviadas</TabsTrigger>
          <TabsTrigger value="apply" className="rounded-lg px-4 py-2">Crear Oportunidad</TabsTrigger>
          <TabsTrigger value="received" className="rounded-lg px-4 py-2">Postulaciones Recibidas ({solicitudesRecibidas.length})</TabsTrigger>
        </TabsList>

        {/* Pestaña: Mis Postulaciones Enviadas */}
        <TabsContent value="sent">
          {applications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No tienes postulaciones enviadas</h3>
              <p className="text-slate-500">Explora las oportunidades disponibles y postula</p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-white p-1 rounded-xl border border-slate-200 mb-8 inline-flex h-auto">
                <TabsTrigger value="all" className="rounded-lg px-4 py-2">Todas ({applications.length})</TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg px-4 py-2">Pendientes ({pending.length})</TabsTrigger>
                <TabsTrigger value="accepted" className="rounded-lg px-4 py-2">Aceptadas ({accepted.length})</TabsTrigger>
                <TabsTrigger value="in_progress" className="rounded-lg px-4 py-2">En Progreso ({inProgress.length})</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg px-4 py-2">Completadas ({completed.length})</TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-lg px-4 py-2">Rechazadas ({rejected.length})</TabsTrigger>
                <TabsTrigger value="cancelled" className="rounded-lg px-4 py-2">Canceladas ({canceled.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-6">{applications.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="pending" className="space-y-6">{pending.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="accepted" className="space-y-6">{accepted.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="in_progress" className="space-y-6">{inProgress.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="completed" className="space-y-6">{completed.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="rejected" className="space-y-6">{rejected.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="cancelled" className="space-y-6">{canceled.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
            </Tabs>
          )}
        </TabsContent>

        {/* Pestaña: Crear Oportunidad */}
        <TabsContent value="apply">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Crear Nueva Oportunidad</h2>
                  <p className="text-sm text-slate-500">Publica una oportunidad y recibe postulaciones de profesionales</p>
                </div>
              </div>

              <form onSubmit={crearOportunidad} className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Título de la Oportunidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleFormChange}
                    placeholder="Ej: Se busca Desarrollador Web Senior"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      formErrors.titulo ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  {formErrors.titulo && <p className="text-red-500 text-sm mt-1">{formErrors.titulo}</p>}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Descripción Detallada <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Describe detalladamente en qué consiste la oportunidad..."
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                      formErrors.descripcion ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  {formErrors.descripcion && <p className="text-red-500 text-sm mt-1">{formErrors.descripcion}</p>}
                </div>

                {/* Grupo y Categoría */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Grupo de Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="grupo"
                      value={formData.grupo}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        formErrors.grupo ? "border-red-500" : "border-slate-200"
                      }`}
                    >
                      <option value="">Selecciona un grupo</option>
                      {grupos.map(grupo => (
                        <option key={grupo} value={grupo}>{grupo}</option>
                      ))}
                    </select>
                    {formErrors.grupo && <p className="text-red-500 text-sm mt-1">{formErrors.grupo}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_Categoria"
                      value={formData.id_Categoria}
                      onChange={handleFormChange}
                      disabled={!formData.grupo}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 ${
                        formErrors.id_Categoria ? "border-red-500" : "border-slate-200"
                      }`}
                    >
                      <option value="">{formData.grupo ? "Selecciona una categoría" : "Selecciona un grupo primero"}</option>
                      {subcategorias.map(cat => (
                        <option key={cat.id_Categoria} value={cat.id_Categoria}>{cat.nombre}</option>
                      ))}
                    </select>
                    {formErrors.id_Categoria && <p className="text-red-500 text-sm mt-1">{formErrors.id_Categoria}</p>}
                  </div>
                </div>

                {/* Tipo de Oportunidad */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tipo de Oportunidad <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: "empleo", label: "Empleo", icon: "💼" },
                      { value: "proyecto", label: "Proyecto", icon: "📋" },
                      { value: "practica", label: "Práctica", icon: "🎓" },
                      { value: "freelance", label: "Freelance", icon: "🚀" }
                    ].map((tipo) => (
                      <label
                        key={tipo.value}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.tipoOportunidad === tipo.value
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipoOportunidad"
                          value={tipo.value}
                          checked={formData.tipoOportunidad === tipo.value}
                          onChange={handleFormChange}
                          className="sr-only"
                        />
                        <span className="text-xl">{tipo.icon}</span>
                        <span className="text-sm font-medium text-slate-700">{tipo.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Presupuesto y Tiempo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Presupuesto (COP)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        name="precio"
                        value={formData.precio}
                        onChange={handleFormChange}
                        placeholder="Ej: 5,000,000"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          formErrors.precio ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                    </div>
                    {formErrors.precio && <p className="text-red-500 text-sm mt-1">{formErrors.precio}</p>}
                    <p className="text-xs text-slate-500 mt-1">Dejar vacío si es a convenir</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Tiempo de Entrega / Duración
                    </label>
                    <select
                      name="tiempoEntrega"
                      value={formData.tiempoEntrega}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="1 semana">1 semana</option>
                      <option value="2 semanas">2 semanas</option>
                      <option value="1 mes">1 mes</option>
                      <option value="2 meses">2 meses</option>
                      <option value="3 meses">3 meses</option>
                      <option value="6 meses">6 meses</option>
                      <option value="Tiempo completo">Tiempo completo</option>
                      <option value="Medio tiempo">Medio tiempo</option>
                      <option value="Por proyecto">Por proyecto</option>
                    </select>
                  </div>
                </div>

                {/* Fecha límite */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Fecha Límite de Postulación
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      name="fechaLimite"
                      value={formData.fechaLimite}
                      onChange={handleFormChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Requisitos */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <FileCheck className="inline w-4 h-4 mr-1" />
                    Requisitos
                  </label>
                  <textarea
                    name="requisitos"
                    value={formData.requisitos}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Lista los requisitos que deben cumplir los postulantes..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Beneficios */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <Gift className="inline w-4 h-4 mr-1" />
                    Beneficios
                  </label>
                  <textarea
                    name="beneficios"
                    value={formData.beneficios}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Describe los beneficios que ofrece esta oportunidad..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Imagen de la Oportunidad
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImagen(e.target.files[0])}
                      className="hidden"
                      id="imagen-oportunidad"
                    />
                    <label htmlFor="imagen-oportunidad" className="cursor-pointer">
                      {imagen ? (
                        <div className="relative inline-block">
                          <img
                            src={URL.createObjectURL(imagen)}
                            alt="Preview"
                            className="max-h-40 rounded-lg mx-auto"
                          />
                          <p className="text-sm text-emerald-600 mt-2">{imagen.name}</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">
                            Arrastra una imagen o <span className="text-emerald-600 font-medium">haz clic para seleccionar</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG hasta 2MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Botón de envío */}
                <div className="pt-4 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={creando}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                  >
                    {creando ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Publicando Oportunidad...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2" size={20} />
                        Publicar Oportunidad
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-slate-500 mt-3">
                    Al publicar, tu oportunidad será visible para todos los usuarios de SkillBay
                  </p>
                </div>
              </form>
            </div>
          </div>
        </TabsContent>

        {/* Pestaña: Postulaciones Recibidas */}
        <TabsContent value="received">
          {solicitudesRecibidas.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No tienes postulaciones recibidas</h3>
              <p className="text-slate-500">Las postulaciones de los usuarios aparecerán aquí cuando publiques oportunidades.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-4">
                {solicitudesRecibidas.map((postulacion) => (
                  <ReceivedApplicationCard key={postulacion.id} postulacion={postulacion} />
                ))}
              </div>
              
              {/* Panel de chat */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-24">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} />
                    Conversación
                  </h3>
                  
                  {!selectedPostulacion ? (
                    <p className="text-sm text-slate-500 text-center py-8">
                      Selecciona una postulación para ver los mensajes
                    </p>
                  ) : (
                    <div className="flex flex-col h-[400px]">
                      <div className="pb-3 mb-3 border-b border-slate-100">
                        <p className="font-medium text-slate-700">{selectedPostulacion.servicio?.titulo}</p>
                        <p className="text-sm text-slate-500">
                          Con: {selectedPostulacion.usuario?.nombre} {selectedPostulacion.usuario?.apellido}
                        </p>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                        {loadingMessages ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin text-blue-500" />
                          </div>
                        ) : messages.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">Sin mensajes aún.</p>
                        ) : (
                          messages.map((msg) => (
                            <div 
                              key={msg.id_Mensaje} 
                              className={`p-3 rounded-lg ${
                                msg.id_Emisor === currentUser.id_CorreoUsuario 
                                  ? "bg-blue-50 border border-blue-100 ml-4" 
                                  : "bg-slate-50 border border-slate-100 mr-4"
                              }`}
                            >
                              <p className="text-xs text-slate-500 mb-1">
                                {msg.emisor?.nombre || msg.id_Emisor} - {" "}
                                {new Date(msg.created_at).toLocaleString("es-CO")}
                              </p>
                              <p className="text-sm text-slate-700">{msg.mensaje}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {selectedPostulacion.estado !== "rechazada" && selectedPostulacion.estado !== "cancelada" && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                          />
                          <Button 
                            onClick={sendMessage}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
