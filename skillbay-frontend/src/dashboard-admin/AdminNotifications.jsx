import { useEffect, useState } from "react";
import { Bell, Mail, AlertTriangle, CheckCircle, X, Trash2, Search, Clock, Shield, Send, Eye } from "lucide-react";
import { API_URL } from "../config/api";
import { showSuccess, showError, showConfirm } from "../utils/swalHelpers";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/notificaciones?scope=all`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(Array.isArray(data?.notificaciones) ? data.notificaciones : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/notificaciones/${id}/leer`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/notificaciones/marcar-todas-leidas?scope=all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      fetchNotifications();
      showSuccess("Todas leidas", "Todas las notificaciones han sido marcadas como leidas.");
    } catch (error) {
      showError("Error", "No se pudieron marcar todas las notificaciones.");
    }
  };

  const deleteNotification = async (id) => {
    const confirmed = await showConfirm("Eliminar notificacion", "Esta accion no se puede deshacer.", "Eliminar");
    if (!confirmed.isConfirmed) return;

    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/notificaciones/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      fetchNotifications();
      showSuccess("Eliminada", "La notificacion ha sido eliminada.");
    } catch (error) {
      showError("Error", "No se pudo eliminar la notificacion.");
    }
  };

  const deleteAll = async () => {
    const confirmed = await showConfirm("Eliminar todas las notificaciones", "Esta accion eliminara todas las notificaciones.", "Eliminar todas");
    if (!confirmed.isConfirmed) return;

    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/notificaciones?scope=all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      fetchNotifications();
      showSuccess("Eliminadas", "Todas las notificaciones han sido eliminadas.");
    } catch (error) {
      showError("Error", "No se pudieron eliminar las notificaciones.");
    }
  };

  const sendGlobalNotification = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/notificaciones/global`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ mensaje: newMessage.trim(), tipo: "admin" }),
      });
      if (!response.ok) throw new Error("No se pudo enviar.");
      setNewMessage("");
      showSuccess("Notificacion enviada", "El mensaje fue enviado a todos los usuarios.");
      fetchNotifications();
    } catch (error) {
      showError("Error al enviar", error.message);
    } finally {
      setSending(false);
    }
  };

  const filtered = notifications.filter((n) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !n.leida) ||
      (filter === "read" && n.leida);
    const matchesSearch =
      !search ||
      (n.mensaje || "").toLowerCase().includes(search.toLowerCase()) ||
      (n.tipo || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.leida).length;

  const typeIcons = {
    admin: { icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
    postulacion: { icon: Send, color: "text-emerald-600", bg: "bg-emerald-50" },
    reporte: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    pago: { icon: CheckCircle, color: "text-amber-600", bg: "bg-amber-50" },
    default: { icon: Bell, color: "text-gray-600", bg: "bg-gray-50" },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Ahora mismo";
    if (mins < 60) return `Hace ${mins} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Notificaciones</h1>
          <p className="text-gray-500 mt-1">
            {notifications.length} notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <AlertTriangle size={14} />
                {unreadCount} sin leer
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <Eye size={16} />
              Marcar todas como leidas
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={deleteAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} />
              Eliminar todas
            </button>
          )}
        </div>
      </div>

      {/* Send Notification */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail size={18} className="text-blue-600" />
          Enviar Notificacion Global
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            className="flex-1 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe el mensaje para todos los usuarios..."
          />
          <button
            onClick={sendGlobalNotification}
            disabled={sending || !newMessage.trim()}
            className="px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium h-fit hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={16} />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar notificaciones..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "Todas" },
            { key: "unread", label: "Sin leer" },
            { key: "read", label: "Leidas" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
              {f.key === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.map((notif) => {
          const typeInfo = typeIcons[notif.tipo] || typeIcons.default;
          const Icon = typeInfo.icon;
          return (
            <div
              key={notif.id_Notificacion}
              className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                notif.leida ? "border-gray-100" : "border-blue-200 bg-blue-50/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${typeInfo.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={typeInfo.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!notif.leida && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                    <p className={`text-sm ${notif.leida ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                      {notif.mensaje}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(notif.created_at)}
                    </span>
                    {notif.tipo && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {notif.tipo}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.leida && (
                    <button
                      onClick={() => markAsRead(notif.id_Notificacion)}
                      className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                      aria-label="Marcar como leida"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id_Notificacion)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                    aria-label="Eliminar notificacion"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-500">
              {search || filter !== "all"
                ? "No se encontraron notificaciones con los filtros aplicados."
                : "No hay notificaciones en este momento."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
