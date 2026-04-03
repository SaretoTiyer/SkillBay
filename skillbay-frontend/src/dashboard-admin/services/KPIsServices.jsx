import { useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Package, Rocket, CheckCircle, Clock, XCircle, FolderTree } from "lucide-react";
import StatCard from "../shared/StatCard";

const COLORS = {
  Activo: "#10b981",
  Borrador: "#f59e0b",
  Inactivo: "#ef4444",
  servicio: "#8b5cf6",
  oportunidad: "#06b6d4",
};

export default function KPIsServices({ services = [] }) {
  const stats = useMemo(() => ({
    total: services.length,
    activos: services.filter(s => s.estado === "Activo").length,
    borrador: services.filter(s => s.estado === "Borrador").length,
    inactivos: services.filter(s => s.estado === "Inactivo").length,
    servicios: services.filter(s => s.tipo === "servicio").length,
    oportunidades: services.filter(s => s.tipo === "oportunidad").length,
  }), [services]);

  const estadoData = useMemo(() => [
    { name: "Activos", value: stats.activos, color: COLORS.Activo },
    { name: "Borrador", value: stats.borrador, color: COLORS.Borrador },
    { name: "Inactivos", value: stats.inactivos, color: COLORS.Inactivo },
  ].filter(d => d.value > 0), [stats]);

  const tipoData = useMemo(() => [
    { name: "Servicios", value: stats.servicios, color: COLORS.servicio },
    { name: "Oportunidades", value: stats.oportunidades, color: COLORS.oportunidad },
  ].filter(d => d.value > 0), [stats]);

  const categoryData = useMemo(() => {
    const catCount = {};
    services.forEach(s => {
      const name = s.categoria?.nombre || 'Sin categoría';
      catCount[name] = (catCount[name] || 0) + 1;
    });
    return Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [services]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Package} label="Total" value={stats.total} color="blue" />
        <StatCard icon={CheckCircle} label="Activos" value={stats.activos} color="emerald" />
        <StatCard icon={Clock} label="Borrador" value={stats.borrador} color="amber" />
        <StatCard icon={XCircle} label="Inactivos" value={stats.inactivos} color="red" />
        <StatCard icon={Package} label="Servicios" value={stats.servicios} color="purple" />
        <StatCard icon={Rocket} label="Oportunidades" value={stats.oportunidades} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {estadoData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Estado</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={estadoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {estadoData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {estadoData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tipoData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tipo</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={tipoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {tipoData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {tipoData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {categoryData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FolderTree size={16} className="text-green-600" />
              Por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" fontSize={11} />
                <YAxis dataKey="name" type="category" fontSize={11} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
