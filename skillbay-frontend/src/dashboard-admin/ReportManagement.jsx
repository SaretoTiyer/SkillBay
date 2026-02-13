import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

function toCSV(rows) {
  const headers = ["ID", "Reportador", "Reportado", "Servicio", "Postulacion", "Estado", "Motivo", "Fecha"];
  const body = rows.map((r) => [
    r.id_Reporte,
    r.id_Reportador,
    r.id_Reportado,
    r.id_Servicio || "",
    r.id_Postulacion || "",
    r.estado,
    (r.motivo || "").replace(/\n/g, " "),
    r.created_at || "",
  ]);
  return [headers, ...body].map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (status !== "all") params.set("estado", status);
      const response = await fetch(`${API_URL}/admin/reportes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      setReports(Array.isArray(data?.reportes) ? data.reportes : []);
    } catch (error) {
      console.error("Error reportes:", error);
    }
  };

  const filtered = useMemo(() => reports, [reports]);

  const changeStatus = async (id, next) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/reportes/${id}/estado`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ estado: next }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar el reporte.");
      fetchReports();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reportes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const content = filtered
      .map((r) => `${r.id_Reporte} | ${r.id_Reportador} -> ${r.id_Reportado} | ${r.estado}\n${r.motivo}\n`)
      .join("\n");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<pre>${content}</pre>`);
    win.document.close();
    win.print();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Gestion de Reportes</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por correo o motivo"
          className="border border-slate-200 rounded px-3 py-2"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 rounded px-3 py-2">
          <option value="all">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En revision</option>
          <option value="resuelto">Resuelto</option>
          <option value="descartado">Descartado</option>
        </select>
        <button onClick={fetchReports} className="px-3 py-2 rounded bg-blue-600 text-white">Filtrar</button>
        <button onClick={exportCSV} className="px-3 py-2 rounded bg-emerald-600 text-white">CSV</button>
        <button onClick={exportPDF} className="px-3 py-2 rounded bg-slate-700 text-white">PDF</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Reportador</th>
              <th className="text-left p-3">Reportado</th>
              <th className="text-left p-3">Contexto</th>
              <th className="text-left p-3">Motivo</th>
              <th className="text-left p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report) => (
              <tr key={report.id_Reporte} className="border-t border-slate-100">
                <td className="p-3">{report.id_Reporte}</td>
                <td className="p-3">{report.id_Reportador}</td>
                <td className="p-3">{report.id_Reportado}</td>
                <td className="p-3">
                  {report.id_Servicio ? `Servicio #${report.id_Servicio}` : ""}
                  {report.id_Postulacion ? ` Postulacion #${report.id_Postulacion}` : ""}
                </td>
                <td className="p-3 max-w-[320px]">{report.motivo}</td>
                <td className="p-3">
                  <select
                    value={report.estado}
                    onChange={(e) => changeStatus(report.id_Reporte, e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En revision</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="descartado">Descartado</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-slate-500">No hay reportes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
