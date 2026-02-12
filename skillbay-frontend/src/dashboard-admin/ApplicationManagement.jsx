import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

export default function ApplicationManagement() {
  const [applications, setApplications] = useState([]);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Gestion de Postulaciones</h1>
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
            {applications.map((app) => (
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
            {applications.length === 0 && (
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
