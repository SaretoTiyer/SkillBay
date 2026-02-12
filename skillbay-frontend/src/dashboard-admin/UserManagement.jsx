import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Gestion de Users</h1>
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
            {users.map((user) => (
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
            {users.length === 0 && (
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
