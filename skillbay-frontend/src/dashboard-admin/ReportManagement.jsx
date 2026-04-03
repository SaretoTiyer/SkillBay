import { useEffect, useMemo, useState } from "react";
import { Search, Download, Flag, AlertTriangle, CheckCircle, Eye, Clock, Trash2, Ban, Bell, X, Package, Rocket, ExternalLink, User, MapPin, DollarSign } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { showSuccess, showError, showConfirm } from "../utils/swalHelpers";
import { getServiceImage, getOpportunityImage } from "../utils/serviceImages";

function toCSV(rows) {
  const headers = ["ID", "Reportador", "Reportado", "Servicio", "Postulacion", "Estado", "Motivo", "Fecha"];
  const body = rows.map((r) => [
    r.id_Reporte,
    r.id_Reportador,
    r.id_Reportado,
    r.id_Servicio || "",
    r.id_Postulacion || "",
    r.estado,
    (r.motivo || "").replace(/\n/g, " "),
    r.created_at || "",
  ]);
  return [headers, ...body].map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [search, status]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (status !== "all") params.set("estado", status);
      const response = await fetch(`${API_URL}/admin/reportes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      setReports(Array.isArray(data?.reportes) ? data.reportes : []);
    } catch (error) {
      console.error("Error reportes:", error);
    }
  };

  const filtered = useMemo(() => reports, [reports]);

  const changeStatus = async (id, next) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/reportes/${id}/estado`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ estado: next }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar el reporte.");
      fetchReports();
      const labels = { pendiente: "Pendiente", en_revision: "En revision", resuelto: "Resuelto", descartado: "Descartado" };
      showSuccess("Estado actualizado", `El reporte ha sido marcado como "${labels[next] || next}".`);
    } catch (error) {
      showError("Error", error.message || "No se pudo actualizar el reporte.");
    }
  };

  const deleteService = async (serviceId) => {
    const confirmed = await showConfirm(
      "Eliminar servicio",
      "El servicio será eliminado permanentemente. Esta acción no se puede deshacer.",
      "Eliminar"
    );
    if (!confirmed.isConfirmed) return;

    setLoadingAction(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/servicios/${serviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!response.ok) throw new Error("No se pudo eliminar el servicio.");
      showSuccess("Eliminado", "El servicio ha sido eliminado.");
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      showError("Error", error.message || "No se pudo eliminar el servicio.");
    } finally {
      setLoadingAction(false);
    }
  };

  const banUser = async (userEmail) => {
    const confirmed = await showConfirm(
      "Bloquear usuario",
      `El usuario ${userEmail} será bloqueado permanentemente. No podrá acceder a la plataforma.`,
      "Bloquear"
    );
    if (!confirmed.isConfirmed) return;

    setLoadingAction(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/usuarios/${encodeURIComponent(userEmail)}/bloquear`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!response.ok) throw new Error("No se pudo bloquear al usuario.");
      showSuccess("Bloqueado", `El usuario ${userEmail} ha sido bloqueado.`);
      fetchReports();
    } catch (error) {
      showError("Error", error.message || "No se pudo bloquear al usuario.");
    } finally {
      setLoadingAction(false);
    }
  };

  const notifyUser = async (userEmail, serviceTitle) => {
    const { value: mensaje } = await Swal.fire({
      title: "Notificar al usuario",
      input: "textarea",
      inputLabel: "Mensaje para el usuario",
      inputPlaceholder: "Tu servicio ha sido marcado como inadecuado...",
      inputValue: `Tu servicio/oportunidad "${serviceTitle}" ha sido revisado y no cumple con las normas de la plataforma. Por favor, revisa tu contenido. Si continúas publicando contenido inadecuado, tu cuenta será bloqueada.`,
      showCancelButton: true,
      confirmButtonText: "Enviar notificación",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      inputValidator: (value) => {
        if (!value || value.length < 10) {
          return "El mensaje debe tener al menos 10 caracteres.";
        }
      },
    });

    if (!mensaje) return;

    setLoadingAction(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/notificaciones/global`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id_CorreoUsuario: userEmail,
          tipo: "cuenta",
          titulo: "Aviso sobre tu contenido",
          mensaje: mensaje,
        }),
      });
      if (!response.ok) throw new Error("No se pudo enviar la notificación.");
      showSuccess("Enviada", "La notificación ha sido enviada al usuario.");
    } catch (error) {
      showError("Error", error.message || "No se pudo enviar la notificación.");
    } finally {
      setLoadingAction(false);
    }
  };

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reportes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColors = {
    pendiente: "bg-amber-100 text-amber-700 border-amber-200",
    en_revision: "bg-blue-100 text-blue-700 border-blue-200",
    resuelto: "bg-emerald-100 text-emerald-700 border-emerald-200",
    descartado: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusIcons = {
    pendiente: AlertTriangle,
    en_revision: Eye,
    resuelto: CheckCircle,
    descartado: Clock,
  };

  const pendingCount = reports.filter((r) => r.estado === "pendiente").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Reportes</h1>
          <p className="text-gray-500 mt-1">
            {reports.length} reportes registrados
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <AlertTriangle size={14} />
                {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por correo o motivo..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En revisión</option>
          <option value="resuelto">Resuelto</option>
          <option value="descartado">Descartado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-${selectedReport ? '2' : '3'}`}>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-600">Reporte</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Reportedo</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Tipo</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Estado</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((report) => {
                    const StatusIcon = statusIcons[report.estado] || AlertTriangle;
                    return (
                      <tr 
                        key={report.id_Reporte} 
                        className={`border-t border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedReport?.id_Reporte === report.id_Reporte ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Flag size={14} className="text-red-500" />
                            <span className="font-mono text-xs text-gray-500">#{report.id_Reporte}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-gray-900 font-medium text-sm truncate max-w-[150px]">{report.id_Reportado}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">por {report.id_Reportador}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {report.id_Servicio && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              <Package size={12} />
                              Servicio
                            </span>
                          )}
                          {report.id_Postulacion && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                              <Rocket size={12} />
                              Postulación
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <select
                            value={report.estado}
                            onChange={(e) => {
                              e.stopPropagation();
                              changeStatus(report.id_Reporte, e.target.value);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[report.estado] || "bg-gray-100 text-gray-700"}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_revision">En revisión</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="descartado">Descartado</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                            }}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        <Flag size={32} className="text-gray-300 mx-auto mb-2" />
                        <p>No se encontraron reportes.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedReport && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Detalles del Reporte</h3>
                <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Reportado por</p>
                  <p className="text-sm text-gray-900">{selectedReport.id_Reportador}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Usuario reportado</p>
                  <p className="text-sm text-gray-900">{selectedReport.id_Reportado}</p>
                </div>

                {selectedReport.id_Servicio && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Servicio ID</p>
                    <p className="text-sm text-gray-900">#{selectedReport.id_Servicio}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Motivo del reporte</p>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                    <p className="text-sm text-gray-700">{selectedReport.motivo}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Fecha</p>
                  <p className="text-sm text-gray-600">
                    {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "Fecha no disponible"}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-3">Acciones rápidas</p>
                  <div className="space-y-2">
                    {selectedReport.id_Servicio && (
                      <>
                        <button
                          onClick={() => deleteService(selectedReport.id_Servicio)}
                          disabled={loadingAction}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Eliminar servicio
                        </button>
                        <button
                          onClick={() => notifyUser(selectedReport.id_Reportado, `Servicio #${selectedReport.id_Servicio}`)}
                          disabled={loadingAction}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                        >
                          <Bell size={16} />
                          Notificar usuario
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => banUser(selectedReport.id_Reportado)}
                      disabled={loadingAction}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
                    >
                      <Ban size={16} />
                      Bloquear usuario
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
