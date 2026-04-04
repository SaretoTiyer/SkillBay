import { useMemo, useState } from "react";
import { 
  Bell, CheckCheck, Trash2, Check, X, ExternalLink, 
  AlertCircle, MessageSquare, FileText, Settings, 
  CheckCircle2, XCircle, Info, Zap, Building2,
  List, LayoutGrid
} from "lucide-react";
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

// Iconos mejorados por tipo de notificación
const getNotificationIcon = (notificacion) => {
  const type = getNotificationType(notificacion);
  const isRead = notificacion.estado === "Leido";
  
  const iconProps = isRead 
    ? { className: "w-5 h-5 text-slate-400" }
    : { className: "w-5 h-5" };
  
  switch (type) {
    case "postulacion":
      return <FileText {...iconProps} style={{ color: isRead ? undefined : '#3B82F6' }} />;
    case "servicio":
      return <Building2 {...iconProps} style={{ color: isRead ? undefined : '#F59E0B' }} />;
    case "reporte":
      return isRead 
        ? <AlertCircle className="w-5 h-5 text-slate-400" />
        : <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return isRead 
        ? <Info className="w-5 h-5 text-slate-400" />
        : <Zap className="w-5 h-5 text-blue-500" />;
  }
};

// Obtener color de fondo del icono según tipo
const getIconBgColor = (notificacion) => {
  const type = getNotificationType(notificacion);
  const isRead = notificacion.estado === "Leido";
  
  if (isRead) return "bg-slate-100";
  
  switch (type) {
    case "postulacion": return "bg-blue-100";
    case "servicio": return "bg-amber-100";
    case "reporte": return "bg-red-100";
    default: return "bg-blue-50";
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

// Componente de estado vacío mejorado
function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
          <Bell className="w-16 h-16 text-slate-300" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="w-3 h-3 bg-slate-200 rounded-full" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {hasFilters ? "No hay notificaciones" : "Todo limpio"}
      </h3>
      <p className="text-slate-500 text-center max-w-xs text-sm">
        {hasFilters 
          ? "No hay notificaciones en esta sección."
          : "No tienes notificaciones pendientes. Te avisaremos cuando lleguen nuevas."}
      </p>
    </div>
  );
}

// Componente de tarjeta de notificación (normal)
function NotificationCard({ item, onNavigate, onMarkRead, onRemove, formatTime }) {
  const isRead = item.estado === "Leido";
  const link = getNotificationLink(item);
  
  return (
    <div 
      className={`
        group relative p-4 rounded-xl border-2 transition-all duration-300
        ${isRead 
          ? "bg-white border-slate-200 hover:border-slate-300" 
          : "bg-gradient-to-r from-blue-50/80 to-white border-l-4 border-l-blue-500 hover:border-l-blue-600 shadow-sm hover:shadow-md animate-pulse-once"
        }
      `}
      style={!isRead ? { animation: 'pulse-soft 2s ease-in-out 1' } : {}}
    >
      {/* Indicador de no leído */}
      {!isRead && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-2.5 rounded-lg shrink-0 ${getIconBgColor(item)}`}>
          {getNotificationIcon(item)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm leading-relaxed ${isRead ? "text-slate-600" : "text-slate-800 font-semibold"}`}>
              {item.mensaje}
            </p>
          </div>
          
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ClockIcon />
              {formatTime(item.created_at)}
            </span>
            
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              isRead
                ? "bg-slate-100 text-slate-500"
                : "bg-blue-100 text-blue-700"
            }`}>
              {isRead ? "Leída" : "Sin leer"}
            </span>
          </div>
          
          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isRead && (
              <button
                onClick={() => onMarkRead(item.id_Notificacion)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-xs font-medium"
              >
                <Check size={14} />
                Marcar leída
              </button>
            )}
            {link && onNavigate && (
              <button
                onClick={() => onNavigate(link.view)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-xs font-medium"
              >
                <ExternalLink size={14} />
                {link.label}
              </button>
            )}
            <button
              onClick={() => onRemove(item.id_Notificacion)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors text-xs font-medium"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de tarjeta de notificación (compacta)
function CompactNotificationCard({ item, onNavigate, onMarkRead, onRemove, formatTime }) {
  const isRead = item.estado === "Leido";
  const link = getNotificationLink(item);
  
  return (
    <div 
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all
        ${isRead 
          ? "border-transparent hover:bg-slate-50" 
          : "bg-blue-50/60 border-l-2 border-l-blue-400"
        }
      `}
    >
      {/* Icon */}
      <div className={`p-1.5 rounded shrink-0 ${getIconBgColor(item)}`}>
        {getNotificationIcon(item)}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isRead ? "text-slate-500" : "text-slate-800 font-medium"}`}>
          {item.mensaje}
        </p>
        <p className="text-xs text-slate-400">{formatTime(item.created_at)}</p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!isRead && (
          <button
            onClick={() => onMarkRead(item.id_Notificacion)}
            className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"
            title="Marcar leída"
          >
            <Check size={14} />
          </button>
        )}
        {link && onNavigate && (
          <button
            onClick={() => onNavigate(link.view)}
            className="p-1.5 rounded hover:bg-blue-100 text-blue-600"
            title={link.label}
          >
            <ExternalLink size={14} />
          </button>
        )}
        <button
          onClick={() => onRemove(item.id_Notificacion)}
          className="p-1.5 rounded hover:bg-red-100 text-red-500"
          title="Eliminar"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// Icono de reloj
function ClockIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export default function NotificationsPage({ onNavigate }) {
  const [activeSection, setActiveSection] = useState("all");
  const [compactMode, setCompactMode] = useState(false);
  const { notifications, sectionCounts, loading, unreadCount,
          markRead, markAllRead, removeOne, clearAll } =
      useNotifications({ section: activeSection });

  // Las notificaciones ya vienen filtradas del backend por sección
  const filteredNotifications = notifications;

  // Agrupar notificaciones por fecha
  const groupedNotifications = useMemo(() => {
    return groupByDate(filteredNotifications);
  }, [filteredNotifications]);

  // Obtener el conteo total de todas las secciones
  const totalCount = useMemo(() => {
    return Object.values(sectionCounts).reduce((a, b) => a + b, 0);
  }, [sectionCounts]);

  // Contador de no leídas en la sección actual
  const currentSectionUnreadCount = useMemo(() => {
    return filteredNotifications.filter(n => n.estado !== "Leido").length;
  }, [filteredNotifications]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-in fade-in duration-500 font-sans">
      {/* Header con badge de unread mejorado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-200">
              <Bell className="text-white h-8 w-8" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce-once">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Mis Notificaciones
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {unreadCount > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    {unreadCount} sin leer
                  </span>
                  {activeSection !== "all" && currentSectionUnreadCount > 0 && (
                    <span className="text-xs text-slate-500">
                      ({currentSectionUnreadCount} en esta sección)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Todo al día
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Toggle de modo compacto */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setCompactMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              !compactMode 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
            title="Vista normal"
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">Normal</span>
          </button>
          <button
            onClick={() => setCompactMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              compactMode 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
            title="Vista compacta"
          >
            <List size={16} />
            <span className="hidden sm:inline">Compacta</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs mejoradas */}
      <div className="w-full mb-6">
        <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200/60">
          {sections.map((section) => {
            const Icon = section.icon;
            const count = section.key === "all" 
              ? totalCount
              : sectionCounts?.[section.key] || 0;
            
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeSection === section.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200/50"
                    : count > 0 
                      ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {Icon && <Icon size={16} />}
                {section.label}
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    activeSection === section.key ? "bg-white/20 text-white" : "bg-amber-200 text-amber-800"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions Bar mejorada */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            disabled={currentSectionUnreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck size={16} />
            <span className="hidden sm:inline">Marcar todo como leído</span>
            <span className="sm:hidden">Marcar leídas</span>
          </button>
          <button
            onClick={clearAll}
            disabled={filteredNotifications.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Borrar todos</span>
            <span className="sm:hidden">Limpiar</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="px-3 py-1 bg-slate-100 rounded-full">
            {filteredNotifications.length} {filteredNotifications.length === 1 ? "notificación" : "notificaciones"}
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-500 font-medium">Cargando notificaciones...</p>
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <EmptyState hasFilters={activeSection !== "all"} />
          </div>
        )}

        {!loading && Object.entries(groupedNotifications).map(([dateKey, items]) => (
          <div key={dateKey}>
            {/* Date Group Header mejorado */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-slate-200"></div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {dateKey}
                </span>
                <span className="text-xs text-slate-400">
                  ({items.length})
                </span>
              </div>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            
            {/* Notifications */}
            <div className={compactMode ? "space-y-1" : "space-y-3"}>
              {items.map((item) => (
                compactMode ? (
                  <CompactNotificationCard 
                    key={item.id_Notificacion}
                    item={item}
                    onNavigate={onNavigate}
                    onMarkRead={markRead}
                    onRemove={removeOne}
                    formatTime={formatTime}
                  />
                ) : (
                  <NotificationCard 
                    key={item.id_Notificacion}
                    item={item}
                    onNavigate={onNavigate}
                    onMarkRead={markRead}
                    onRemove={removeOne}
                    formatTime={formatTime}
                  />
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CSS para animaciones */}
      <style>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        .animate-pulse-once {
          animation: pulse-soft 2s ease-in-out 1;
        }
        .animate-bounce-once {
          animation: bounce 0.5s ease-out 1;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}