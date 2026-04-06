import { useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Users, UserCheck, UserX, Crown, UserCog, Shield } from "lucide-react";
import StatCard from "../shared/StatCard";

const COLORS = {
  admin: "#dc2626",
  ofertante: "#7c3aed",
  cliente: "#2563eb",
};

export default function KPIsUsers({ users = [] }) {
  const stats = useMemo(() => ({
    total: users.length,
    activos: users.filter(u => !u.bloqueado).length,
    bloqueados: users.filter(u => u.bloqueado).length,
    admins: users.filter(u => u.rol === 'admin').length,
    ofertantes: users.filter(u => u.rol === 'ofertante').length,
    clientes: users.filter(u => u.rol === 'cliente').length,
  }), [users]);

  const roleData = useMemo(() => [
    { name: "Admins", value: stats.admins, color: COLORS.admin },
    { name: "Ofertantes", value: stats.ofertantes, color: COLORS.ofertante },
    { name: "Clientes", value: stats.clientes, color: COLORS.cliente },
  ].filter(d => d.value > 0), [stats]);

  const planData = useMemo(() => {
    const planCount = {};
    users.forEach(u => {
      const plan = u.id_Plan || 'Sin plan';
      planCount[plan] = (planCount[plan] || 0) + 1;
    });
    return Object.entries(planCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Users} label="Total" value={stats.total} color="blue" />
        <StatCard icon={UserCheck} label="Activos" value={stats.activos} color="emerald" />
        <StatCard icon={UserX} label="Bloqueados" value={stats.bloqueados} color="red" />
        <StatCard icon={Shield} label="Admins" value={stats.admins} color="orange" />
        <StatCard icon={UserCog} label="Ofertantes" value={stats.ofertantes} color="purple" />
        <StatCard icon={Users} label="Clientes" value={stats.clientes} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roleData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Distribucion por Rol</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {roleData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {planData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Usuarios por Plan</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={planData} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} width={60} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
