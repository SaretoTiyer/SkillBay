import { useState } from "react";
import { Search, Download, Shield, ShieldOff, Users, FileText } from "lucide-react";
import { API_URL } from "../../config/api";
import { showSuccess, showError, showConfirm } from "../../utils/swalHelpers";
import KPIsUsers from "./KPIsUsers";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      setUsers(Array.isArray(data?.usuarios) ? data.usuarios : []);
    } catch (error) {
      console.error("Error users:", error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (user) => {
    const action = user.bloqueado ? "desbloquear" : "bloquear";
    const confirmed = await showConfirm(
      `${user.bloqueado ? "Desbloquear" : "Bloquear"} usuario`,
      `Estas seguro que deseas ${action} a ${user.nombre} ${user.apellido}?`,
      user.bloqueado ? "Desbloquear" : "Bloquear"
    );
    if (!confirmed.isConfirmed) return;

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
      showSuccess(user.bloqueado ? "Usuario desbloqueado" : "Usuario bloqueado", `${user.nombre} ${user.apellido} ha sido ${user.bloqueado ? "desbloqueado" : "bloqueado"} correctamente.`);
    } catch (error) {
      showError("Error", error.message || "No se pudo actualizar el estado del usuario.");
    }
  };

  const filtered = users.filter((user) => {
    const matchesSearch = user.id_CorreoUsuario?.toLowerCase().includes(search.toLowerCase()) ||
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "blocked" && user.bloqueado) ||
      (statusFilter === "active" && !user.bloqueado);
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ["Correo", "Nombre", "Rol", "Plan", "Estado"];
    const rows = filtered.map((u) => [u.id_CorreoUsuario, `${u.nombre} ${u.apellido}`, u.rol, u.id_Plan || "", u.bloqueado ? "Bloqueado" : "Activo"]);
    const csv = [headers, ...rows].map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "usuarios.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getInitials = (nombre, apellido) => `${(nombre || "").charAt(0)}${(apellido || "").charAt(0)}`.toUpperCase() || "U";

  const roleColors = { admin: "bg-red-100 text-red-700", cliente: "bg-blue-100 text-blue-700", ofertante: "bg-emerald-100 text-emerald-700" };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Usuarios</h1>
          <p className="text-gray-500 mt-1">{users.length} usuarios registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      <KPIsUsers users={users} />

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por correo o nombre..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="blocked">Bloqueados</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Usuario</th>
                <th className="text-left p-4 font-semibold text-gray-600">Correo</th>
                <th className="text-left p-4 font-semibold text-gray-600">Rol</th>
                <th className="text-left p-4 font-semibold text-gray-600">Plan</th>
                <th className="text-left p-4 font-semibold text-gray-600">Estado</th>
                <th className="text-left p-4 font-semibold text-gray-600">Accion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id_CorreoUsuario} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(user.nombre, user.apellido)}
                      </div>
                      <p className="font-medium text-gray-900">{user.nombre} {user.apellido}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{user.id_CorreoUsuario}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.rol] || "bg-gray-100 text-gray-700"}`}>{user.rol}</span>
                  </td>
                  <td className="p-4 text-gray-600">{user.id_Plan || "Sin plan"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.bloqueado ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.bloqueado ? "bg-red-500" : "bg-emerald-500"}`} />
                      {user.bloqueado ? "Bloqueado" : "Activo"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleBlock(user)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${user.bloqueado ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
                      {user.bloqueado ? <ShieldOff size={14} /> : <Shield size={14} />}
                      {user.bloqueado ? "Desbloquear" : "Bloquear"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-gray-500" colSpan={6}>
                    <Users size={32} className="text-gray-300 mx-auto mb-2" />
                    <p>No se encontraron usuarios.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
