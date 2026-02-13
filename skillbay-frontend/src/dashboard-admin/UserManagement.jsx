import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await response.json();
      setUsers(Array.isArray(data?.usuarios) ? data.usuarios : []);
    } catch (error) {
      console.error("Error users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (user) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/usuarios/${user.id_CorreoUsuario}/bloqueo`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ bloqueado: !user.bloqueado }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar.");
      await fetchUsers();
      Swal.fire("Listo", "Estado del usuario actualizado.", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  if (loading) {
    return <p className="text-slate-500">Cargando usuarios...</p>;
  }

  const filtered = users.filter((user) => {
    const matchesSearch =
      user.id_CorreoUsuario?.toLowerCase().includes(search.toLowerCase()) ||
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "blocked" && user.bloqueado) ||
      (statusFilter === "active" && !user.bloqueado);
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ["Correo", "Nombre", "Rol", "Plan", "Estado"];
    const rows = filtered.map((u) => [
      u.id_CorreoUsuario,
      `${u.nombre} ${u.apellido}`,
      u.rol,
      u.id_Plan || "",
      u.bloqueado ? "Bloqueado" : "Activo",
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "usuarios.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const text = filtered
      .map((u) => `${u.id_CorreoUsuario} | ${u.nombre} ${u.apellido} | ${u.rol} | ${u.bloqueado ? "Bloqueado" : "Activo"}`)
      .join("\n");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<pre>${text}</pre>`);
    win.document.close();
    win.print();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Gestion de Users</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por correo o nombre"
          className="border border-slate-200 rounded px-3 py-2"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded px-3 py-2">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="blocked">Bloqueados</option>
        </select>
        <button onClick={exportCSV} className="px-3 py-2 rounded bg-emerald-600 text-white">CSV</button>
        <button onClick={exportPDF} className="px-3 py-2 rounded bg-slate-700 text-white">PDF</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Correo</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-left p-3">Plan</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Accion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id_CorreoUsuario} className="border-t border-slate-100">
                <td className="p-3">{user.id_CorreoUsuario}</td>
                <td className="p-3">{`${user.nombre} ${user.apellido}`}</td>
                <td className="p-3">{user.rol}</td>
                <td className="p-3">{user.id_Plan || "Sin plan"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.bloqueado ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {user.bloqueado ? "Bloqueado" : "Activo"}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleBlock(user)}
                    className={`px-3 py-1 rounded text-white ${
                      user.bloqueado ? "bg-emerald-600" : "bg-red-600"
                    }`}
                  >
                    {user.bloqueado ? "Desbloquear" : "Bloquear"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-4 text-slate-500" colSpan={6}>
                  No hay usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
