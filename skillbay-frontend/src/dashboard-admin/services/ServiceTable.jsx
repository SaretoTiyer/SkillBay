import { useState, useEffect } from "react";
import { Search, Download, Trash2, Package, Rocket, Edit3, CheckCircle, XCircle, Clock } from "lucide-react";
import { API_URL } from "../../config/api";
import { showSuccess, showError, showConfirm } from "../../utils/swalHelpers";
import { getServiceImage } from "../../utils/serviceImages";
import KPIsServices from "./KPIsServices";

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("all");
  const [estado, setEstado] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (tipo !== "all") params.set("tipo", tipo);
      if (estado !== "all") params.set("estado", estado);

      const response = await fetch(`${API_URL}/admin/servicios?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      setServices(Array.isArray(data?.servicios) ? data.servicios : []);
    } catch (error) {
      console.error("Error servicios:", error);
      showError("Error", "No se pudieron cargar los servicios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [tipo, estado]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const changeStatus = async (id, nuevoEstado) => {
    const confirmed = await showConfirm("Cambiar estado", `¿Cambiar el estado a "${nuevoEstado}"?`, "Confirmar");
    if (!confirmed.isConfirmed) return;

    setLoadingAction(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/servicios/${id}/estado`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!response.ok) throw new Error("No se pudo cambiar el estado.");
      showSuccess("Estado actualizado", `El servicio ahora está "${nuevoEstado}".`);
      fetchServices();
    } catch (error) {
      showError("Error", error.message || "No se pudo cambiar el estado.");
    } finally {
      setLoadingAction(false);
    }
  };

  const deleteService = async (id, titulo) => {
    const confirmed = await showConfirm("Eliminar servicio", `¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`, "Eliminar");
    if (!confirmed.isConfirmed) return;

    setLoadingAction(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/servicios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!response.ok) throw new Error("No se pudo eliminar el servicio.");
      showSuccess("Eliminado", "El servicio ha sido eliminado.");
      fetchServices();
    } catch (error) {
      showError("Error", error.message || "No se pudo eliminar el servicio.");
    } finally {
      setLoadingAction(false);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Título", "Tipo", "Dueño", "Categoría", "Precio", "Estado", "Fecha"];
    const body = services.map(s => [s.id_Servicio, s.titulo, s.tipo, s.id_Dueno, s.categoria?.nombre || "", s.precio || "", s.estado, s.fechaPublicacion || ""]);
    const csv = [headers, ...body].map(line => line.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "servicios.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getInitials = (nombre, apellido) => `${(nombre || "").charAt(0)}${(apellido || "").charAt(0)}`.toUpperCase() || "U";

  const statusColors = { Activo: "bg-emerald-100 text-emerald-700", Borrador: "bg-amber-100 text-amber-700", Inactivo: "bg-red-100 text-red-700" };
  const statusIcons = { Activo: CheckCircle, Borrador: Clock, Inactivo: XCircle };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Servicios</h1>
          <p className="text-gray-500 mt-1">{services.length} servicios/oportunidades registrados</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      <KPIsServices services={services} />

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por titulo o email..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todos los tipos</option>
          <option value="servicio">Servicios</option>
          <option value="oportunidad">Oportunidades</option>
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Borrador">Borrador</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Servicio</th>
                <th className="text-left p-4 font-semibold text-gray-600">Tipo</th>
                <th className="text-left p-4 font-semibold text-gray-600">Dueño</th>
                <th className="text-left p-4 font-semibold text-gray-600">Categoria</th>
                <th className="text-left p-4 font-semibold text-gray-600">Precio</th>
                <th className="text-left p-4 font-semibold text-gray-600">Estado</th>
                <th className="text-left p-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => {
                const StatusIcon = statusIcons[service.estado] || Clock;
                const imageUrl = getServiceImage(service);
                return (
                  <tr key={service.id_Servicio} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {imageUrl ? <img src={imageUrl} alt={service.titulo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="text-gray-400" size={20} /></div>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{service.titulo}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{service.descripcion?.substring(0, 40)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${service.tipo === "servicio" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-cyan-50 text-cyan-700 border-cyan-200"}`}>
                        {service.tipo === "servicio" ? <Package size={12} /> : <Rocket size={12} />}
                        {service.tipo === "servicio" ? "Servicio" : "Oportunidad"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {getInitials(service.cliente_usuario?.nombre, service.cliente_usuario?.apellido)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-700 text-sm">{service.cliente_usuario?.nombre} {service.cliente_usuario?.apellido}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{service.categoria?.nombre || "-"}</td>
                    <td className="p-4 font-semibold text-gray-900">{service.precio ? `$${Number(service.precio).toLocaleString("es-CO")}` : "-"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[service.estado] || "bg-gray-100 text-gray-700"}`}>
                        <StatusIcon size={12} />
                        {service.estado}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <div className="relative group">
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100">
                            <Edit3 size={14} /> Estado
                          </button>
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
                            {service.estado !== "Activo" && <button onClick={() => changeStatus(service.id_Servicio, "Activo")} disabled={loadingAction} className="w-full px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 rounded-t-lg flex items-center gap-2"><CheckCircle size={14} /> Activo</button>}
                            {service.estado !== "Borrador" && <button onClick={() => changeStatus(service.id_Servicio, "Borrador")} disabled={loadingAction} className="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2"><Clock size={14} /> Borrador</button>}
                            {service.estado !== "Inactivo" && <button onClick={() => changeStatus(service.id_Servicio, "Inactivo")} disabled={loadingAction} className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 rounded-b-lg flex items-center gap-2"><XCircle size={14} /> Inactivo</button>}
                          </div>
                        </div>
                        <button onClick={() => deleteService(service.id_Servicio, service.titulo)} disabled={loadingAction} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {services.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-gray-500" colSpan={7}>
                    <Package size={32} className="text-gray-300 mx-auto mb-2" />
                    <p>No se encontraron servicios.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
