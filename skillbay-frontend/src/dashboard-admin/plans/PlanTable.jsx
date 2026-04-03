import { useState, useEffect } from "react";
import { Search, Download, Plus, Edit2, Trash2, CreditCard, X, Save } from "lucide-react";
import { API_URL } from "../../config/api";
import { showSuccess, showError, showConfirm } from "../../utils/swalHelpers";
import KPIsPlans from "./KPIsPlans";

const initialForm = { id_Plan: "", nombre: "", beneficios: "", precioMensual: 0, limiteServiciosMes: 3 };

export default function PlanManagement() {
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/usuarios`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      const data = await response.json();
      setUsers(Array.isArray(data?.usuarios) ? data.usuarios : []);
    } catch (error) { console.error("Error fetching users:", error); }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/planes`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      const data = await response.json();
      setPlans(Array.isArray(data?.planes) ? data.planes : []);
    } catch (error) { console.error("Error planes:", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const isEdit = Boolean(editingId);
    const url = isEdit ? `${API_URL}/admin/planes/${editingId}` : `${API_URL}/admin/planes`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error("No se pudo guardar.");
      setForm(initialForm); setEditingId(null); setShowModal(false);
      fetchPlans();
      showSuccess("Plan guardado", `El plan ha sido ${isEdit ? "actualizado" : "creado"} correctamente.`);
    } catch (error) { showError("Error", error.message || "No se pudo guardar el plan."); }
  };

  const startEdit = (plan) => {
    setEditingId(plan.id_Plan);
    setForm({ id_Plan: plan.id_Plan, nombre: plan.nombre, beneficios: plan.beneficios || "", precioMensual: plan.precioMensual, limiteServiciosMes: plan.limiteServiciosMes || 0 });
    setShowModal(true);
  };

  const removePlan = async (id) => {
    const confirmed = await showConfirm("Eliminar plan", "Esta accion no se puede deshacer.", "Eliminar");
    if (!confirmed.isConfirmed) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/planes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (!response.ok) throw new Error("No se pudo eliminar.");
      fetchPlans(); fetchUsers();
      showSuccess("Plan eliminado", "El plan ha sido eliminado correctamente.");
    } catch (error) { showError("Error", error.message || "No se pudo eliminar el plan."); }
  };

  const filtered = plans.filter(p => `${p.id_Plan} ${p.nombre}`.toLowerCase().includes(search.toLowerCase()));

  const exportCSV = () => {
    const headers = ["ID", "Nombre", "Precio", "Limite", "Beneficios"];
    const rows = filtered.map(p => [p.id_Plan, p.nombre, p.precioMensual, p.limiteServiciosMes, p.beneficios || ""]);
    const csv = [headers, ...rows].map(line => line.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "planes.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Planes</h1>
          <p className="text-gray-500 mt-1">{plans.length} planes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Download size={16} /> CSV</button>
          <button onClick={() => { setForm(initialForm); setEditingId(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"><Plus size={16} /> Crear Plan</button>
        </div>
      </div>

      <KPIsPlans plans={plans} users={users} />

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar plan..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Plan</th>
                <th className="text-left p-4 font-semibold text-gray-600">Precio</th>
                <th className="text-left p-4 font-semibold text-gray-600">Limite</th>
                <th className="text-left p-4 font-semibold text-gray-600">Beneficios</th>
                <th className="text-left p-4 font-semibold text-gray-600">Accion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(plan => (
                <tr key={plan.id_Plan} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center"><CreditCard size={16} className="text-white" /></div>
                      <div><p className="font-medium text-gray-900">{plan.nombre}</p><p className="text-xs text-gray-500">{plan.id_Plan}</p></div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-gray-900">${Number(plan.precioMensual).toLocaleString("es-CO")} COP</td>
                  <td className="p-4 text-gray-600">{plan.limiteServiciosMes} servicios/mes</td>
                  <td className="p-4 text-gray-600 max-w-[200px] truncate">{plan.beneficios || "-"}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(plan)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit2 size={14} /></button>
                      <button onClick={() => removePlan(plan.id_Plan)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="p-8 text-center text-gray-500" colSpan={5}><CreditCard size={32} className="text-gray-300 mx-auto mb-2" /><p>No se encontraron planes.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? "Editar Plan" : "Crear Plan"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Plan</label>
                <input value={form.id_Plan} onChange={(e) => setForm({ ...form, id_Plan: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={!!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Mensual (COP)</label>
                <input type="number" value={form.precioMensual} onChange={(e) => setForm({ ...form, precioMensual: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limite Servicios/Mes</label>
                <input type="number" value={form.limiteServiciosMes} onChange={(e) => setForm({ ...form, limiteServiciosMes: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficios</label>
                <textarea value={form.beneficios} onChange={(e) => setForm({ ...form, beneficios: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"><Save size={16} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
