import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

export default function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/postulaciones`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      setApplications(Array.isArray(data?.postulaciones) ? data.postulaciones : []);
    } catch (error) {
      console.error("Error postulaciones admin:", error);
    }
  };

  const changeStatus = async (id, estado) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/postulaciones/${id}/estado`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ estado }),
      });
      if (!response.ok) throw new Error("No se pudo cambiar el estado.");
      fetchApplications();
      Swal.fire("Actualizado", "Estado de postulacion actualizado.", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      (app.servicio?.titulo || "").toLowerCase().includes(search.toLowerCase()) ||
      (app.usuario?.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      (app.usuario?.apellido || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || app.estado === status;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ["ID", "Servicio", "Usuario", "Presupuesto", "Estado"];
    const rows = filtered.map((a) => [
      a.id,
      a.servicio?.titulo || "",
      `${a.usuario?.nombre || ""} ${a.usuario?.apellido || ""}`.trim(),
      a.presupuesto || "",
      a.estado,
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "postulaciones.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const text = filtered
      .map((a) => `#${a.id} | ${a.servicio?.titulo || "Servicio"} | ${a.usuario?.nombre || ""} ${a.usuario?.apellido || ""} | ${a.estado}`)
      .join("\n");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<pre>${text}</pre>`);
    win.document.close();
    win.print();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Gestion de Postulaciones</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por servicio o usuario"
          className="border border-slate-200 rounded px-3 py-2"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 rounded px-3 py-2">
          <option value="all">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <button onClick={exportCSV} className="px-3 py-2 rounded bg-emerald-600 text-white">CSV</button>
        <button onClick={exportPDF} className="px-3 py-2 rounded bg-slate-700 text-white">PDF</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Servicio</th>
              <th className="text-left p-3">Usuario</th>
              <th className="text-left p-3">Presupuesto</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Accion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <tr key={app.id} className="border-t border-slate-100">
                <td className="p-3">{app.servicio?.titulo || "Sin titulo"}</td>
                <td className="p-3">{`${app.usuario?.nombre || ""} ${app.usuario?.apellido || ""}`}</td>
                <td className="p-3">{app.presupuesto ? `$${Number(app.presupuesto).toLocaleString("es-CO")}` : "-"}</td>
                <td className="p-3">{app.estado}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => changeStatus(app.id, "aceptada")} className="px-2 py-1 bg-emerald-600 text-white rounded">
                    Aceptar
                  </button>
                  <button onClick={() => changeStatus(app.id, "rechazada")} className="px-2 py-1 bg-red-600 text-white rounded">
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-4 text-slate-500" colSpan={5}>
                  No hay postulaciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
