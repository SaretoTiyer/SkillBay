import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { API_URL } from "../config/api";
import { useNotifications } from '../hooks/useNotifications';

const sections = [
  { key: "sistema", label: "Sistema" },
  { key: "postulacion", label: "Postulacion" },
  { key: "reporte", label: "Reporte" },
  { key: "servicio", label: "Su servicio" },
];

export default function NotificationCenter({ isAdmin = false, onActionComplete }) {
  const [currentSection, setCurrentSection] = useState("sistema");
  const { notifications, sectionCounts, loading, unreadCount,
          markRead, markAllRead, removeOne, clearAll, refetch } =
      useNotifications({ isAdmin, section: currentSection });

  // Wrap functions to include onActionComplete
  const wrappedMarkAllRead = async () => {
    await markAllRead();
    onActionComplete && onActionComplete();
  };

  const wrappedClearAll = async () => {
    await clearAll();
    onActionComplete && onActionComplete();
  };

  const wrappedMarkRead = async (id) => {
    await markRead(id);
    onActionComplete && onActionComplete();
  };

  const wrappedRemoveOne = async (id) => {
    await removeOne(id);
    onActionComplete && onActionComplete();
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
              currentSection === section.key ? "bg-blue-600 text-white" : (sectionCounts?.[section.key] > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700")
            }`}
          >
            {section.label} {sectionCounts?.[section.key] > 0 ? `(${sectionCounts[section.key]})` : ""}
          </button>
        ))}
      </div>

      <div className="p-3 border-b border-slate-200 flex gap-2">
        <button onClick={wrappedMarkAllRead} className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 flex items-center gap-1">
          <CheckCheck size={14} />
          Marcar leido
        </button>
        <button onClick={wrappedClearAll} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1">
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
                  <button onClick={() => wrappedMarkRead(item.id_Notificacion)} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                    Leido
                  </button>
                )}
                <button onClick={() => wrappedRemoveOne(item.id_Notificacion)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
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
