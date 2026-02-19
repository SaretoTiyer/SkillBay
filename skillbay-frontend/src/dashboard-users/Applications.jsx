import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { AlertCircle, Calendar, CheckCircle, Clock, DollarSign, FileText, Loader2, Plus, User, XCircle } from "lucide-react";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const emptyCreateForm = {
  titulo: "",
  descripcion: "",
  precio: "",
  tiempo_entrega: "",
  id_Categoria: "",
  estado: "Borrador",
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [myCreated, setMyCreated] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCreateForm);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchApplications(), fetchCreatedApplications(), fetchCategories()]).finally(() => setLoading(false));
  }, []);

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

  const fetchCreatedApplications = async () => {
    const response = await fetch(`${API_URL}/servicios`, { headers: authHeaders() });
    if (!response.ok) return;
    const data = await response.json();
    setMyCreated(Array.isArray(data) ? data : []);
  };

  const fetchCategories = async () => {
    const response = await fetch(`${API_URL}/categorias`, { headers: authHeaders() });
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data)) setCategories(data);
    if (Array.isArray(data?.categorias)) setCategories(data.categorias);
  };

  const openPublicProfile = (idCorreo) => {
    if (!idCorreo) return;
    localStorage.setItem("profile_target_user", idCorreo);
    localStorage.setItem("currentView", "public_profile");
    window.location.reload();
  };

  const viewDetails = async (application) => {
    await Swal.fire({
      title: `Detalle #${application.id}`,
      html: `
        <div style="text-align:left">
          <p><strong>Servicio:</strong> ${application.servicio?.titulo || "N/A"}</p>
          <p><strong>Estado:</strong> ${application.estado}</p>
          <p><strong>Presupuesto:</strong> ${application.presupuesto ? `$${Number(application.presupuesto).toLocaleString("es-CO")}` : "A convenir"}</p>
          <p><strong>Tiempo:</strong> ${application.tiempo_estimado || "No definido"}</p>
          <p><strong>Mensaje:</strong> ${application.mensaje || ""}</p>
        </div>
      `,
    });
  };

  const editProposal = async (application) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar propuesta",
      html:
        `<textarea id="swal-msg" class="swal2-textarea" placeholder="Mensaje">${application.mensaje || ""}</textarea>` +
        `<input id="swal-budget" class="swal2-input" type="number" placeholder="Presupuesto" value="${application.presupuesto || ""}" />` +
        `<input id="swal-time" class="swal2-input" placeholder="Tiempo estimado" value="${application.tiempo_estimado || ""}" />`,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      preConfirm: () => ({
        mensaje: document.getElementById("swal-msg").value,
        presupuesto: document.getElementById("swal-budget").value,
        tiempo_estimado: document.getElementById("swal-time").value,
      }),
    });
    if (!formValues) return;
    const response = await fetch(`${API_URL}/postulaciones/${application.id}`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify(formValues),
    });
    const data = await response.json();
    if (!response.ok) return Swal.fire("Error", data?.message || "No se pudo editar.", "error");
    Swal.fire("Actualizado", "Propuesta actualizada.", "success");
    fetchApplications();
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

  const submitCreatedApplication = async () => {
    if (!form.titulo || !form.descripcion || !form.id_Categoria) {
      return Swal.fire("Campos requeridos", "Completa titulo, descripcion y categoria.", "info");
    }

    const url = editingServiceId ? `${API_URL}/servicios/${editingServiceId}` : `${API_URL}/servicios`;
    const method = editingServiceId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: authHeaders(true),
      body: JSON.stringify({
        titulo: form.titulo,
        descripcion: form.descripcion,
        precio: form.precio || null,
        tiempo_entrega: form.tiempo_entrega || null,
        id_Categoria: form.id_Categoria,
        estado: form.estado || "Borrador",
      }),
    });
    const data = await response.json();
    if (!response.ok) return Swal.fire("Error", data?.message || "No se pudo guardar.", "error");

    setForm(emptyCreateForm);
    setEditingServiceId(null);
    Swal.fire("Guardado", "Postulacion creada/actualizada.", "success");
    fetchCreatedApplications();
  };

  const editCreatedApplication = (item) => {
    setEditingServiceId(item.id_Servicio);
    setForm({
      titulo: item.titulo || "",
      descripcion: item.descripcion || "",
      precio: item.precio || "",
      tiempo_entrega: item.tiempo_entrega || "",
      id_Categoria: item.id_Categoria || "",
      estado: item.estado || "Borrador",
    });
  };

  const publishCreatedApplication = async (item) => {
    const response = await fetch(`${API_URL}/servicios/${item.id_Servicio}`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify({
        titulo: item.titulo,
        descripcion: item.descripcion,
        precio: item.precio || null,
        tiempo_entrega: item.tiempo_entrega || null,
        id_Categoria: item.id_Categoria,
        estado: "Activo",
      }),
    });
    const data = await response.json();
    if (!response.ok) return Swal.fire("Error", data?.message || "No se pudo publicar.", "error");
    Swal.fire("Publicado", "Ya esta visible en Explorar Oportunidades.", "success");
    fetchCreatedApplications();
  };

  const deleteCreatedApplication = async (item) => {
    const confirm = await Swal.fire({
      title: "Eliminar postulacion creada",
      text: "Esta accion no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    });
    if (!confirm.isConfirmed) return;
    const response = await fetch(`${API_URL}/servicios/${item.id_Servicio}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return Swal.fire("Error", data?.message || "No se pudo eliminar.", "error");
    fetchCreatedApplications();
  };

  const pending = applications.filter((a) => a.estado === "pendiente");
  const accepted = applications.filter((a) => a.estado === "aceptada");
  const rejected = applications.filter((a) => a.estado === "rechazada");
  const canceled = applications.filter((a) => a.estado === "cancelada");

  const getStatusBadge = (status) => {
    switch (status) {
      case "pendiente":
        return <Badge className="bg-amber-500 text-white"><Clock size={14} className="inline mr-1" />Pendiente</Badge>;
      case "aceptada":
        return <Badge className="bg-emerald-500 text-white"><CheckCircle size={14} className="inline mr-1" />Aceptada</Badge>;
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
            <Button variant="outline" onClick={() => viewDetails(application)}>Ver Detalles</Button>
            {application.estado === "pendiente" && (
              <>
                <Button variant="outline" onClick={() => editProposal(application)}>Editar Propuesta</Button>
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

  const createdByStatus = useMemo(() => {
    const borrador = myCreated.filter((s) => s.estado === "Borrador" || s.estado === "Inactivo");
    const publicado = myCreated.filter((s) => s.estado === "Activo");
    return { borrador, publicado };
  }, [myCreated]);

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
        <p className="text-slate-500 mt-1">Envios realizados y seccion para crear nuevas postulaciones.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
          <div className="flex"><AlertCircle className="h-5 w-5 text-red-500" /><div className="ml-3"><p className="text-sm text-red-700">{error}</p></div></div>
        </div>
      )}

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="bg-white p-1 rounded-xl border border-slate-200 mb-8 inline-flex h-auto">
          <TabsTrigger value="sent" className="rounded-lg px-4 py-2">Mis propuestas enviadas</TabsTrigger>
          <TabsTrigger value="create" className="rounded-lg px-4 py-2">CrearApplication</TabsTrigger>
        </TabsList>

        <TabsContent value="sent">
          {applications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No tienes postulaciones enviadas</h3>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-white p-1 rounded-xl border border-slate-200 mb-8 inline-flex h-auto">
                <TabsTrigger value="all" className="rounded-lg px-4 py-2">Todas ({applications.length})</TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg px-4 py-2">Pendientes ({pending.length})</TabsTrigger>
                <TabsTrigger value="accepted" className="rounded-lg px-4 py-2">Aceptadas ({accepted.length})</TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-lg px-4 py-2">Rechazadas ({rejected.length})</TabsTrigger>
                <TabsTrigger value="cancelled" className="rounded-lg px-4 py-2">Canceladas ({canceled.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-6">{applications.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="pending" className="space-y-6">{pending.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="accepted" className="space-y-6">{accepted.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="rejected" className="space-y-6">{rejected.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
              <TabsContent value="cancelled" className="space-y-6">{canceled.map((a) => <ApplicationCard key={a.id} application={a} />)}</TabsContent>
            </Tabs>
          )}
        </TabsContent>

        <TabsContent value="create">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Plus size={16} /> {editingServiceId ? "Editar postulación creada" : "Nueva postulación creada"}</h2>
              <Input placeholder="Titulo" value={form.titulo} onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))} />
              <Textarea placeholder="Descripcion" value={form.descripcion} onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))} />
              <Input type="number" placeholder="Precio (COP)" value={form.precio} onChange={(e) => setForm((prev) => ({ ...prev, precio: e.target.value }))} />
              <Input placeholder="Tiempo estimado" value={form.tiempo_entrega} onChange={(e) => setForm((prev) => ({ ...prev, tiempo_entrega: e.target.value }))} />
              <Select value={form.id_Categoria} onValueChange={(value) => setForm((prev) => ({ ...prev, id_Categoria: value }))}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id_Categoria} value={c.id_Categoria}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.estado} onValueChange={(value) => setForm((prev) => ({ ...prev, estado: value }))}>
                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Borrador">Borrador</SelectItem>
                  <SelectItem value="Activo">Publicar ahora</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full bg-blue-600 text-white" onClick={submitCreatedApplication}>
                {editingServiceId ? "Actualizar" : "Crear y guardar"}
              </Button>
            </div>

            <div className="xl:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-3">Publicadas ({createdByStatus.publicado.length})</h3>
                <div className="space-y-3">
                  {createdByStatus.publicado.map((item) => (
                    <div key={item.id_Servicio} className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{item.titulo}</p>
                        <p className="text-xs text-slate-500">Estado: {item.estado}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editCreatedApplication(item)}>Editar</Button>
                        <Button size="sm" variant="outline" className="border-red-200 text-red-700" onClick={() => deleteCreatedApplication(item)}>
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {createdByStatus.publicado.length === 0 && <p className="text-sm text-slate-500">No tienes postulaciones publicadas.</p>}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-3">Borradores/Inactivas ({createdByStatus.borrador.length})</h3>
                <div className="space-y-3">
                  {createdByStatus.borrador.map((item) => (
                    <div key={item.id_Servicio} className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{item.titulo}</p>
                        <p className="text-xs text-slate-500">Estado: {item.estado}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editCreatedApplication(item)}>Editar</Button>
                        <Button size="sm" className="bg-emerald-600 text-white" onClick={() => publishCreatedApplication(item)}>Publicar</Button>
                        <Button size="sm" variant="outline" className="border-red-200 text-red-700" onClick={() => deleteCreatedApplication(item)}>
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {createdByStatus.borrador.length === 0 && <p className="text-sm text-slate-500">No tienes borradores.</p>}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
