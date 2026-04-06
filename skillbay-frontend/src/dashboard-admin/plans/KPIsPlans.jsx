import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CreditCard, Users, DollarSign, Crown, TrendingUp } from "lucide-react";
import StatCard from "../shared/StatCard";

export default function KPIsPlans({ plans = [], users = [] }) {
  const stats = useMemo(() => ({
    total: plans.length,
    usuarios: users.length,
    planMasPopular: (() => {
      const counts = {};
      users.forEach(u => { const p = u.id_Plan || 'Sin plan'; counts[p] = (counts[p] || 0) + 1; });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      return top ? top[0] : '-';
    })(),
  }), [plans, users]);

  const planData = useMemo(() => {
    const counts = {};
    users.forEach(u => { const p = u.id_Plan || 'Sin plan'; counts[p] = (counts[p] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={CreditCard} label="Planes" value={stats.total} color="blue" />
        <StatCard icon={Users} label="Usuarios" value={stats.usuarios} color="emerald" />
        <StatCard icon={Crown} label="Mas Popular" value={stats.planMasPopular} color="amber" />
        <StatCard icon={TrendingUp} label="Activos" value={stats.usuarios} color="purple" />
      </div>

      {planData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown size={16} className="text-amber-600" />
            Usuarios por Plan
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={planData} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" fontSize={12} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
