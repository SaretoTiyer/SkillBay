import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { API_URL } from "../config/api";

const sections = [
  { key: "sistema", label: "Sistema" },
  { key: "postulacion", label: "Postulacion" },
  { key: "reporte", label: "Reporte" },
  { key: "servicio", label: "Su servicio" },
];

export default function NotificationCenter({ isAdmin = false }) {
  const [currentSection, setCurrentSection] = useState("sistema");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications(currentSection);
  }, [currentSection]);

  const fetchNotifications = async (section) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      params.set("seccion", section);
      if (isAdmin) params.set("scope", "all");

      const response = await fetch(`${API_URL}/notificaciones?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(Array.isArray(data?.notificaciones) ? data.notificaciones : []);
    } catch (error) {
      console.error("Error notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.estado !== "Leido").length,
    [notifications]
  );

  const requestHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  const markAllRead = async () => {
    const params = new URLSearchParams();
    params.set("seccion", currentSection);
    if (isAdmin) params.set("scope", "all");
    await fetch(`${API_URL}/notificaciones/marcar-todas-leidas?${params.toString()}`, {
      method: "PATCH",
      headers: requestHeaders(),
    });
    fetchNotifications(currentSection);
  };

  const clearAll = async () => {
    const params = new URLSearchParams();
    params.set("seccion", currentSection);
    if (isAdmin) params.set("scope", "all");
    await fetch(`${API_URL}/notificaciones?${params.toString()}`, {
      method: "DELETE",
      headers: requestHeaders(),
    });
    fetchNotifications(currentSection);
  };

  const markRead = async (id) => {
    await fetch(`${API_URL}/notificaciones/${id}/leer`, {
      method: "PATCH",
      headers: requestHeaders(),
    });
    fetchNotifications(currentSection);
  };

  const removeOne = async (id) => {
    await fetch(`${API_URL}/notificaciones/${id}`, {
      method: "DELETE",
      headers: requestHeaders(),
    });
    fetchNotifications(currentSection);
  };

  return (
    <div className="w-[360px] sm:w-[420px] max-h-[520px] overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xl">
      <div className="p-3 bg-linear-to-r from-[#1E3A5F] to-[#2B6CB0] text-white">
        <div className="flex items-center justify-between">
          <p className="font-semibold flex items-center gap-2">
            <Bell size={16} />
            Centro de Notificaciones
          </p>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">{unreadCount} sin leer</span>
        </div>
      </div>

      <div className="p-3 border-b border-slate-200 flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => setCurrentSection(section.key)}
            className={`px-2.5 py-1 rounded-full text-xs ${
              currentSection === section.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="p-3 border-b border-slate-200 flex gap-2">
        <button onClick={markAllRead} className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 flex items-center gap-1">
          <CheckCheck size={14} />
          Marcar leido
        </button>
        <button onClick={clearAll} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1">
          <Trash2 size={14} />
          Borrar todos
        </button>
      </div>

      <div className="max-h-[340px] overflow-y-auto">
        {loading && <p className="p-4 text-sm text-slate-500">Cargando...</p>}
        {!loading && notifications.length === 0 && <p className="p-4 text-sm text-slate-500">No hay notificaciones.</p>}
        {notifications.map((item) => (
          <div key={item.id_Notificacion} className="p-3 border-b border-slate-100">
            <p className="text-sm text-slate-700">{item.mensaje}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">{item.estado}</span>
              <div className="flex gap-1">
                {item.estado !== "Leido" && (
                  <button onClick={() => markRead(item.id_Notificacion)} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                    Leido
                  </button>
                )}
                <button onClick={() => removeOne(item.id_Notificacion)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
