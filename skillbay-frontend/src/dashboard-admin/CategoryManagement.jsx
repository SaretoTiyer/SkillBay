import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

const initialForm = { id_Categoria: "", nombre: "", descripcion: "" };

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/categorias`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      setCategories(Array.isArray(data?.categorias) ? data.categorias : []);
    } catch (error) {
      console.error("Error categorias:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const isEdit = Boolean(editingId);
    const url = isEdit ? `${API_URL}/admin/categorias/${editingId}` : `${API_URL}/admin/categorias`;
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
      fetchCategories();
      Swal.fire("Listo", "Categoria guardada.", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id_Categoria);
    setForm({
      id_Categoria: category.id_Categoria,
      nombre: category.nombre,
      descripcion: category.descripcion || "",
    });
  };

  const removeCategory = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/categorias/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error("No se pudo eliminar.");
      fetchCategories();
      Swal.fire("Eliminada", "Categoria eliminada.", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Descripcion</th>
              <th className="text-left p-3">Accion</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id_Categoria} className="border-t border-slate-100">
                <td className="p-3">{category.id_Categoria}</td>
                <td className="p-3">{category.nombre}</td>
                <td className="p-3">{category.descripcion || "-"}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => startEdit(category)} className="px-3 py-1 bg-blue-600 text-white rounded">
                    Editar
                  </button>
                  <button onClick={() => removeCategory(category.id_Categoria)} className="px-3 py-1 bg-red-600 text-white rounded">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h2 className="font-semibold text-slate-800">{editingId ? "Editar categoria" : "Crear categoria"}</h2>
        {!editingId && (
          <input
            className="w-full border border-slate-200 rounded p-2"
            value={form.id_Categoria}
            onChange={(e) => setForm((prev) => ({ ...prev, id_Categoria: e.target.value }))}
            placeholder="ID (opcional)"
          />
        )}
        <input
          className="w-full border border-slate-200 rounded p-2"
          value={form.nombre}
          onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
          placeholder="Nombre"
          required
        />
        <textarea
          className="w-full border border-slate-200 rounded p-2"
          value={form.descripcion}
          onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Descripcion"
        />
        <button type="submit" className="w-full py-2 rounded bg-emerald-600 text-white">
          {editingId ? "Actualizar" : "Crear"}
        </button>
      </form>
    </div>
  );
}
