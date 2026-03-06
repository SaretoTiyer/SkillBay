import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Trash2, Check, X, ExternalLink, AlertCircle, MessageSquare, FileText, Settings } from "lucide-react";
import { API_URL } from "../../config/api";
import Swal from 'sweetalert2';
import { useNotifications } from '../../hooks/useNotifications';

const sections = [
  { key: "all", label: "Todas" },
  { key: "sistema", label: "Sistema", icon: Settings },
  { key: "postulacion", label: "Postulaciones", icon: FileText },
  { key: "servicio", label: "Mis Servicios", icon: AlertCircle },
  { key: "reporte", label: "Reportes", icon: AlertCircle },
];

// Mapeo de tipos de notificación a secciones
const getNotificationType = (notificacion) => {
  const tipo = notificacion.tipo?.toLowerCase();
  if (tipo === "postulacion" || tipo === "solicitud") return "postulacion";
  if (tipo === "reporte") return "reporte";
  if (tipo === "servicio") return "servicio";
  return "sistema";
};

// Agrupar notificaciones por fecha
const groupByDate = (notifications) => {
  const groups = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  notifications.forEach((notif) => {
    const date = new Date(notif.created_at);
    date.setHours(0, 0, 0, 0);
    
    let dateKey;
    if (date.getTime() === today.getTime()) {
      dateKey = "Hoy";
    } else if (date.getTime() === yesterday.getTime()) {
      dateKey = "Ayer";
    } else {
      dateKey = date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notif);
  });
  
  return groups;
};

export default function NotificationsPage({ onNavigate }) {
  const [activeSection, setActiveSection] = useState("all");
  const { notifications, sectionCounts, loading, unreadCount,
          markRead, markAllRead, removeOne, clearAll } =
      useNotifications({ section: activeSection });

  // Las notificaciones ya vienen filtradas del backend por sección
  const filteredNotifications = notifications;

  // Agrupar notificaciones por fecha
  const groupedNotifications = useMemo(() => {
    return groupByDate(filteredNotifications);
  }, [filteredNotifications]);

  // Obtener icono según tipo de notificación
  const getNotificationIcon = (tipo) => {
    const type = getNotificationType({ tipo });
    switch (type) {
      case "postulacion":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "servicio":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "reporte":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  // Obtener enlace según tipo de notificación
  const getNotificationLink = (notificacion) => {
    const type = getNotificationType(notificacion);
    switch (type) {
      case "postulacion":
        return { view: "applications", label: "Ver solicitudes" };
      case "servicio":
        return { view: "services", label: "Ver servicios" };
      case "reporte":
        return { view: "explore", label: "Ver detalles" };
      default:
        return null;
    }
  };

  // Formatear hora
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-200">
            <Bell className="text-white h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Mis Notificaciones
            </h1>
            <p className="text-slate-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : "Sin notificaciones pendientes"}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="w-full mb-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const count = section.key === "all" 
              ? Object.values(sectionCounts).reduce((a, b) => a + b, 0)
              : sectionCounts?.[section.key] || 0;
            
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSection === section.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {Icon && <Icon size={16} />}
                {section.label}
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    activeSection === section.key ? "bg-white/20" : "bg-amber-100 text-amber-700"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-sm font-medium"
          >
            <CheckCheck size={16} />
            Marcar todo como leído
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Borrar todos
          </button>
        </div>
        
        <div className="text-sm text-slate-500">
          {filteredNotifications.length} notificación{filteredNotifications.length !== 1 ? "es" : ""}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-500">Cargando notificaciones...</p>
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Bell className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No hay notificaciones</p>
            <p className="text-slate-400 text-sm mt-1">
              Las notificaciones aparecerán aquí cuando existan
            </p>
          </div>
        )}

        {!loading && Object.entries(groupedNotifications).map(([dateKey, items]) => (
          <div key={dateKey}>
            <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
              {dateKey}
            </h3>
            <div className="space-y-3">
              {items.map((item) => {
                const isRead = item.estado === "Leido";
                const link = getNotificationLink(item);
                
                return (
                  <div
                    key={item.id_Notificacion}
                    className={`p-4 rounded-xl border transition-all ${
                      isRead
                        ? "bg-white border-slate-200"
                        : "bg-blue-50 border-blue-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isRead ? "bg-slate-100" : "bg-blue-100"
                      }`}>
                        {getNotificationIcon(item.tipo)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${isRead ? "text-slate-600" : "text-slate-800 font-medium"}`}>
                            {item.mensaje}
                          </p>
                          <span className="text-xs text-slate-400 shrink-0">
                            {formatTime(item.created_at)}
                          </span>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isRead
                              ? "bg-slate-100 text-slate-500"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {isRead ? "Leída" : "Sin leer"}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {!isRead && (
                            <button
                              onClick={() => markRead(item.id_Notificacion)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-xs font-medium"
                            >
                              <Check size={14} />
                              Marcar leída
                            </button>
                          )}
                          {link && onNavigate && (
                            <button
                              onClick={() => onNavigate(link.view)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-medium"
                            >
                              <ExternalLink size={14} />
                              {link.label}
                            </button>
                          )}
                          <button
                            onClick={() => removeOne(item.id_Notificacion)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-xs font-medium"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
