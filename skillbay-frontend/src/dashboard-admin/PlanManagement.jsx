import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

const initialForm = {
  id_Plan: "Free",
  nombre: "Free",
  beneficios: "",
  precioMensual: 0,
  limiteServiciosMes: 3,
};

export default function PlanManagement() {
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/planes`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      setPlans(Array.isArray(data?.planes) ? data.planes : []);
    } catch (error) {
      console.error("Error planes:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const isEdit = Boolean(editingId);
    const url = isEdit ? `${API_URL}/admin/planes/${editingId}` : `${API_URL}/admin/planes`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("No se pudo guardar.");
      setForm(initialForm);
      setEditingId(null);
      fetchPlans();
      Swal.fire("Listo", "Plan guardado correctamente.", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const startEdit = (plan) => {
    setEditingId(plan.id_Plan);
    setForm({
      id_Plan: plan.id_Plan,
      nombre: plan.nombre,
      beneficios: plan.beneficios || "",
      precioMensual: plan.precioMensual,
      limiteServiciosMes: plan.limiteServiciosMes || 0,
    });
  };

  const filtered = plans.filter((plan) =>
    `${plan.id_Plan} ${plan.nombre}`.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["ID", "Nombre", "Precio", "Limite", "Beneficios"];
    const rows = filtered.map((p) => [p.id_Plan, p.nombre, p.precioMensual, p.limiteServiciosMes, p.beneficios || ""]);
    const csv = [headers, ...rows]
      .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "planes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 p-3 flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar plan" className="border border-slate-200 rounded px-3 py-2" />
        <button onClick={exportCSV} className="px-3 py-2 rounded bg-emerald-600 text-white">CSV</button>
      </div>
      <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Precio</th>
              <th className="text-left p-3">Limite</th>
              <th className="text-left p-3">Accion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((plan) => (
              <tr key={plan.id_Plan} className="border-t border-slate-100">
                <td className="p-3">{plan.id_Plan}</td>
                <td className="p-3">{plan.nombre}</td>
                <td className="p-3">${Number(plan.precioMensual).toLocaleString("es-CO")} COP</td>
                <td className="p-3">{plan.limiteServiciosMes}</td>
                <td className="p-3">
                  <button onClick={() => startEdit(plan)} className="px-3 py-1 bg-blue-600 text-white rounded">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h2 className="font-semibold text-slate-800">{editingId ? "Editar plan" : "Crear plan"}</h2>
        {!editingId && (
          <input
            className="w-full border border-slate-200 rounded p-2"
            value={form.id_Plan}
            onChange={(e) => setForm((prev) => ({ ...prev, id_Plan: e.target.value }))}
            placeholder="ID"
          />
        )}
        <input
          className="w-full border border-slate-200 rounded p-2"
          value={form.nombre}
          onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
          placeholder="Nombre"
        />
        <textarea
          className="w-full border border-slate-200 rounded p-2"
          value={form.beneficios}
          onChange={(e) => setForm((prev) => ({ ...prev, beneficios: e.target.value }))}
          placeholder="Beneficios"
        />
        <input
          type="number"
          className="w-full border border-slate-200 rounded p-2"
          value={form.precioMensual}
          onChange={(e) => setForm((prev) => ({ ...prev, precioMensual: Number(e.target.value) }))}
          placeholder="Precio mensual"
        />
        <input
          type="number"
          className="w-full border border-slate-200 rounded p-2"
          value={form.limiteServiciosMes}
          onChange={(e) => setForm((prev) => ({ ...prev, limiteServiciosMes: Number(e.target.value) }))}
          placeholder="Limite servicios"
        />
        <button type="submit" className="w-full py-2 rounded bg-emerald-600 text-white">
          {editingId ? "Actualizar" : "Crear"}
        </button>
      </form>
    </div>
  );
}
