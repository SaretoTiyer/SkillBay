import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Users, Briefcase, Send, Flag, DollarSign, Shield, BarChart3, Mail, Activity, Bell, Crown, Star, Package, Rocket } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { showSuccess, showError } from "../utils/swalHelpers";
import StatCard from "./shared/StatCard";
import StarRating from "./shared/StarRating";

const COLORS = {
  admin: "#dc2626",
  ofertante: "#8b5cf6",
  cliente: "#2563eb",
  Activo: "#10b981",
  Borrador: "#f59e0b",
  Inactivo: "#ef4444",
};

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [metricas, setMetricas] = useState({});
  const [topOfertantes, setTopOfertantes] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [topServicios, setTopServicios] = useState([]);
  const [resenasResumen, setResenasResumen] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

      const [resumenRes, metricasRes, ofertantesRes, clientesRes, serviciosRes, resenasRes, postulacionesRes, reportesRes] = await Promise.all([
        fetch(`${API_URL}/admin/resumen`, { headers }),
        fetch(`${API_URL}/admin/metricas`, { headers }),
        fetch(`${API_URL}/admin/analytics/top-ofertantes`, { headers }),
        fetch(`${API_URL}/admin/analytics/top-clientes`, { headers }),
        fetch(`${API_URL}/admin/analytics/top-servicios`, { headers }),
        fetch(`${API_URL}/admin/analytics/resenas-resumen`, { headers }),
        fetch(`${API_URL}/admin/postulaciones`, { headers }),
        fetch(`${API_URL}/admin/reportes`, { headers }),
      ]);

      const resumenData = resumenRes.ok ? await resumenRes.json() : { resumen: {} };
      const metricasData = metricasRes.ok ? await metricasRes.json() : {};
      const ofertantes = ofertantesRes.ok ? await ofertantesRes.json() : { top: [] };
      const clientes = clientesRes.ok ? await clientesRes.json() : { top: [] };
      const servicios = serviciosRes.ok ? await serviciosRes.json() : { top: [] };
      const resenas = resenasRes.ok ? await resenasRes.json() : { resumen: {} };
      const postulaciones = postulacionesRes.ok ? await postulacionesRes.json() : { postulaciones: [] };
      const reportes = reportesRes.ok ? await reportesRes.json() : { reportes: [] };

      setResumen(resumenData?.resumen || {});
      setMetricas(metricasData);
      setTopOfertantes(ofertantes?.top || []);
      setTopClientes(clientes?.top || []);
      setTopServicios(servicios?.top || []);
      setResenasResumen(resenas?.resumen || null);

      const activities = [];
      const posts = Array.isArray(postulaciones?.postulaciones) ? postulaciones.postulaciones : [];
      const reps = Array.isArray(reportes?.reportes) ? reportes.reportes : [];

      posts.slice(0, 5).forEach(p => {
        activities.push({ type: "postulacion", title: `Nueva postulacion: ${p.servicio?.titulo || "Servicio"}`, desc: `${p.usuario?.nombre || "Usuario"} se postulo`, date: p.created_at, icon: Send, color: "text-blue-600", bg: "bg-blue-50" });
      });
      reps.slice(0, 3).forEach(r => {
        activities.push({ type: "reporte", title: `Reporte #${r.id_Reporte}`, desc: `Motivo: ${(r.motivo || "").substring(0, 30)}...`, date: r.created_at, icon: Flag, color: "text-red-600", bg: "bg-red-50" });
      });
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(activities.slice(0, 8));
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const enviarNotificacionGlobal = async () => {
    if (!mensaje.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/notificaciones/global`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ mensaje: mensaje.trim(), tipo: "admin" }),
      });
      if (!response.ok) throw new Error("No se pudo enviar.");
      setMensaje("");
      showSuccess("Notificacion enviada", "El mensaje fue enviado a todos los usuarios.");
    } catch (error) {
      showError("Error al enviar", error.message);
    } finally {
      setSending(false);
    }
  };

  const getInitials = (nombre, apellido) => `${(nombre || "").charAt(0)}${(apellido || "").charAt(0)}`.toUpperCase() || "U";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const roleData = useMemo(() => {
    const rol = metricas?.usuariosPorRol || {};
    return [
      { name: "Admins", value: rol.admin || 0, color: COLORS.admin },
      { name: "Ofertantes", value: rol.ofertante || 0, color: COLORS.ofertante },
      { name: "Clientes", value: rol.cliente || 0, color: COLORS.cliente },
    ].filter(d => d.value > 0);
  }, [metricas]);

  const serviciosTipoData = useMemo(() => {
    const tipo = metricas?.serviciosPorTipo || {};
    return [
      { name: "Servicios", value: tipo.servicio || 0, color: "#8b5cf6" },
      { name: "Oportunidades", value: tipo.oportunidad || 0, color: "#06b6d4" },
    ].filter(d => d.value > 0);
  }, [metricas]);

  const serviciosEstadoData = useMemo(() => {
    const estado = metricas?.serviciosPorEstado || {};
    return [
      { name: "Activos", value: estado.Activo || 0, color: COLORS.Activo },
      { name: "Borrador", value: estado.Borrador || 0, color: COLORS.Borrador },
      { name: "Inactivos", value: estado.Inactivo || 0, color: COLORS.Inactivo },
    ].filter(d => d.value > 0);
  }, [metricas]);

  const usuariosPorMesData = useMemo(() => {
    return (metricas?.usuariosPorMes || []).map(item => ({ mes: item.mes?.split("-")[1] || item.mes, usuarios: Number(item.total) }));
  }, [metricas]);

  const ingresosPorMesData = useMemo(() => {
    return (metricas?.ingresosPorMes || []).map(item => ({ mes: item.mes?.split("-")[1] || item.mes, ingresos: Number(item.total || 0) }));
  }, [metricas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administracion</h1>
          <p className="text-gray-500 mt-1">Resumen general y analisis de la plataforma</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium">
          <Activity size={16} /> Sistema operativo
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard icon={Users} label="Total Usuarios" value={resumen?.usuarios || 0} color="blue" />
        <StatCard icon={Briefcase} label="Servicios" value={resumen?.servicios || 0} color="emerald" />
        <StatCard icon={Send} label="Postulaciones" value={resumen?.postulacionesPendientes || 0} color="amber" />
        <StatCard icon={Flag} label="Reportes" value={resumen?.reportesPendientes || 0} color="red" />
        <StatCard icon={DollarSign} label="Ingresos" value={`$${(resumen?.ingresosPlanes || 0).toLocaleString("es-CO")}`} color="green" />
        <StatCard icon={Shield} label="Bloqueados" value={resumen?.usuariosBloqueados || 0} color="orange" />
        <StatCard icon={BarChart3} label="Categorias" value={resumen?.categorias || 0} color="purple" />
        <StatCard icon={Star} label="Reseñas" value={resenasResumen?.total || 0} color="cyan" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-600" /> Registros por Mes
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={usuariosPorMesData}>
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="usuarios" fill="#3b82f6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-600" /> Ingresos por Mes
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ingresosPorMesData}>
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="ingresos" fill="#10b981" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 - Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {roleData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Usuarios por Rol</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {roleData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {serviciosTipoData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Servicios por Tipo</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={serviciosTipoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {serviciosTipoData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {serviciosEstadoData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Servicios por Estado</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={serviciosEstadoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {serviciosEstadoData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Rated Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Ofertantes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown size={16} className="text-amber-500" /> Top Ofertantes
          </h3>
          <div className="space-y-3">
            {topOfertantes.length > 0 ? topOfertantes.map((user, i) => (
              <div key={user.email} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500"}`}>
                  {i + 1}
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {getInitials(user.nombre, user.apellido)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.nombre} {user.apellido}</p>
                  <StarRating rating={user.promedio} size={12} />
                </div>
                <span className="text-xs text-gray-500">{user.total_resenas} resenas</span>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-4">Sin datos</p>}
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> Top Clientes
          </h3>
          <div className="space-y-3">
            {topClientes.length > 0 ? topClientes.map((user, i) => (
              <div key={user.email} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500"}`}>
                  {i + 1}
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {getInitials(user.nombre, user.apellido)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.nombre} {user.apellido}</p>
                  <StarRating rating={user.promedio} size={12} />
                </div>
                <span className="text-xs text-gray-500">{user.total_resenas} resenas</span>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-4">Sin datos</p>}
          </div>
        </div>

        {/* Top Servicios */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={16} className="text-purple-500" /> Top Servicios
          </h3>
          <div className="space-y-3">
            {topServicios.length > 0 ? topServicios.map((service, i) => (
              <div key={service.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500"}`}>
                  {i + 1}
                </div>
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100">
                  {service.imagen ? <img src={service.imagen} alt={service.titulo} className="w-full h-full object-cover" /> : <Package className="text-gray-400 w-full h-full flex items-center justify-center" size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{service.titulo}</p>
                  <StarRating rating={service.promedio} size={12} />
                </div>
                <span className="text-xs text-gray-500">{service.total_resenas}</span>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-4">Sin datos</p>}
          </div>
        </div>
      </div>

      {/* Reviews Summary + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={16} className="text-amber-500" /> Resumen de Reseñas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{resenasResumen?.total || 0}</p>
              <p className="text-sm text-gray-500">Total Reseñas</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <StarRating rating={resenasResumen?.promedio_general || 0} size={24} />
              <p className="text-sm text-gray-500 mt-1">Promedio General</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <StarRating rating={resenasResumen?.como_ofertante || 0} size={20} />
              <p className="text-sm text-gray-600 mt-1">Como Ofertante</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <StarRating rating={resenasResumen?.como_cliente || 0} size={20} />
              <p className="text-sm text-gray-600 mt-1">Como Cliente</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-blue-600" /> Actividad Reciente
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
                <div className={`w-9 h-9 ${activity.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <activity.icon size={16} className={activity.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.desc}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(activity.date)}</span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Sin actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      {/* Global Notification */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Mail size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Notificacion Global</h2>
            <p className="text-xs text-gray-500">Envia un aviso a todos los usuarios</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-700">Este mensaje sera enviado como notificacion a <strong>todos los usuarios</strong> de la plataforma.</p>
        </div>
        <textarea className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" rows={3} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Escribe el mensaje para todos los usuarios..." />
        <div className="flex justify-between mt-3">
          <p className="text-xs text-gray-400">{mensaje.length}/500 caracteres</p>
          <button onClick={enviarNotificacionGlobal} disabled={sending || !mensaje.trim()} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
