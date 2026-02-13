import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

export default function AdminOverview() {
  const [resumen, setResumen] = useState(null);
  const [metricas, setMetricas] = useState({ usuariosPorMes: [], ingresosPorMes: [] });
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetchResumen();
    fetchMetricas();
  }, []);

  const fetchResumen = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/resumen`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setResumen(data?.resumen || null);
    } catch (error) {
      console.error("Error resumen admin:", error);
    }
  };

  const fetchMetricas = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/metricas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setMetricas({
        usuariosPorMes: Array.isArray(data?.usuariosPorMes) ? data.usuariosPorMes : [],
        ingresosPorMes: Array.isArray(data?.ingresosPorMes) ? data.ingresosPorMes : [],
      });
    } catch (error) {
      console.error("Error metricas admin:", error);
    }
  };

  const cards = [
    { label: "Usuarios", value: resumen?.usuarios ?? 0 },
    { label: "Usuarios bloqueados", value: resumen?.usuariosBloqueados ?? 0 },
    { label: "Planes", value: resumen?.planes ?? 0 },
    { label: "Servicios", value: resumen?.servicios ?? 0 },
    { label: "Postulaciones", value: resumen?.postulaciones ?? 0 },
    { label: "Postulaciones pendientes", value: resumen?.postulacionesPendientes ?? 0 },
    { label: "Reportes pendientes", value: resumen?.reportesPendientes ?? 0 },
    { label: "Categorias", value: resumen?.categorias ?? 0 },
    { label: "Notificaciones no leidas", value: resumen?.notificacionesPendientes ?? 0 },
    { label: "Ingresos planes (COP)", value: Number(resumen?.ingresosPlanes ?? 0).toLocaleString("es-CO") },
  ];

  const enviarNotificacionGlobal = async () => {
    if (!mensaje.trim()) return;
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
          mensaje: mensaje.trim(),
          tipo: "admin",
        }),
      });
      if (!response.ok) throw new Error("No se pudo enviar.");
      setMensaje("");
      Swal.fire("Enviado", "Notificacion enviada a todos los usuarios.", "success");
      fetchResumen();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Registros de usuarios por mes</h2>
          <div className="space-y-2">
            {metricas.usuariosPorMes.map((item) => (
              <div key={item.mes} className="flex items-center gap-3">
                <span className="w-20 text-xs text-slate-500">{item.mes}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded">
                  <div className="h-3 bg-blue-600 rounded" style={{ width: `${Math.min(Number(item.total) * 12, 100)}%` }} />
                </div>
                <span className="text-sm text-slate-700">{item.total}</span>
              </div>
            ))}
            {metricas.usuariosPorMes.length === 0 && <p className="text-sm text-slate-500">Sin datos.</p>}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Ingresos por planes (COP) por mes</h2>
          <div className="space-y-2">
            {metricas.ingresosPorMes.map((item) => (
              <div key={item.mes} className="flex items-center gap-3">
                <span className="w-20 text-xs text-slate-500">{item.mes}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded">
                  <div className="h-3 bg-emerald-600 rounded" style={{ width: `${Math.min(Number(item.total) / 5000, 100)}%` }} />
                </div>
                <span className="text-sm text-slate-700">${Number(item.total || 0).toLocaleString("es-CO")}</span>
              </div>
            ))}
            {metricas.ingresosPorMes.length === 0 && <p className="text-sm text-slate-500">Sin datos.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Notificacion Global</h2>
        <p className="text-sm text-slate-500 mb-3">Envia un aviso a todos los usuarios de la plataforma.</p>
        <div className="flex flex-col md:flex-row gap-3">
          <textarea
            className="flex-1 border border-slate-200 rounded-lg p-2"
            rows={3}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Mensaje para todos los usuarios..."
          />
          <button onClick={enviarNotificacionGlobal} className="px-4 py-2 rounded-lg bg-blue-600 text-white h-fit">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
