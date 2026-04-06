import { useEffect, useState, useMemo } from "react";
import { Search, Download, Plus, Edit2, Trash2, FolderTree, Tag, Image as ImageIcon, X, Save, Layers, BarChart3, Package, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { showSuccess, showError, showConfirm } from "../utils/swalHelpers";
import { resolveImageUrl } from "../utils/image";
import { getCategoryPlaceholder } from "../utils/categoryPlaceholders";

const initialForm = { id_Categoria: "", nombre: "", descripcion: "", grupo: "", imagen: "" };

const GROUP_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset preview error when image URL changes
  useEffect(() => {
    setImgError(false);
  }, [form.imagen]);

  // KPIs computed from loaded categories
  const kpis = useMemo(() => {
    const total = categories.length;
    const grupos = [...new Set(categories.map(c => c.grupo).filter(Boolean))];
    const conImagen = categories.filter(c => c.imagen).length;
    const sinImagen = total - conImagen;
    const porGrupo = grupos.map((g, i) => ({
      name: g,
      total: categories.filter(c => c.grupo === g).length,
      color: GROUP_COLORS[i % GROUP_COLORS.length],
    })).sort((a, b) => b.total - a.total);
    return { total, grupos: grupos.length, conImagen, sinImagen, porGrupo };
  }, [categories]);

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
    if (!form.nombre.trim()) {
      showError("Campo requerido", "El nombre de la categoria es obligatorio.");
      return;
    }
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
      setShowModal(false);
      fetchCategories();
      showSuccess(
        isEdit ? "Categoria actualizada" : "Categoria creada",
        `La categoria ha sido ${isEdit ? "actualizada" : "creada"} correctamente.`
      );
    } catch (error) {
      showError("Error", error.message || "No se pudo guardar la categoria.");
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id_Categoria);
    setForm({
      id_Categoria: category.id_Categoria,
      nombre: category.nombre,
      descripcion: category.descripcion || "",
      grupo: category.grupo || "",
      imagen: category.imagen || "",
    });
    setShowModal(true);
  };

  const removeCategory = async (id) => {
    const confirmed = await showConfirm(
      "Eliminar categoria",
      "Esta accion no se puede deshacer. Los servicios asociados quedaran sin categoria.",
      "Eliminar"
    );
    if (!confirmed.isConfirmed) return;

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
      showSuccess("Categoria eliminada", "La categoria ha sido eliminada correctamente.");
    } catch (error) {
      showError("Error", error.message || "No se pudo eliminar la categoria.");
    }
  };

  const filtered = categories.filter((c) =>
    `${c.id_Categoria} ${c.nombre} ${c.descripcion || ""} ${c.grupo || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const grupos = [...new Set(categories.map((c) => c.grupo).filter(Boolean))];

  const getCategoryImgSrc = (category) => {
    if (category.imagen) return resolveImageUrl(category.imagen);
    return getCategoryPlaceholder({ categoria: { nombre: category.nombre, grupo: category.grupo } }, 80, 60);
  };

  const exportCSV = () => {
    const headers = ["ID", "Nombre", "Descripcion", "Grupo"];
    const rows = filtered.map((c) => [c.id_Categoria, c.nombre, c.descripcion || "", c.grupo || ""]);
    const csv = [headers, ...rows]
      .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "categorias.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
          <p className="text-gray-500 mt-1">{categories.length} categorías registradas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Download size={16} /> Exportar CSV
          </button>
          <button
            onClick={() => { setForm(initialForm); setEditingId(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Crear Categoría
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Tag size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{kpis.total}</p>
            <p className="text-xs text-gray-500">Total Categorías</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Layers size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{kpis.grupos}</p>
            <p className="text-xs text-gray-500">Grupos</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ImageIcon size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{kpis.conImagen}</p>
            <p className="text-xs text-gray-500">Con imagen</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Package size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{kpis.sinImagen}</p>
            <p className="text-xs text-gray-500">Sin imagen</p>
          </div>
        </div>
      </div>

      {/* Chart por grupo */}
      {kpis.porGrupo.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-600" /> Categorías por Grupo
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={kpis.porGrupo} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" fontSize={12} tick={{ fill: "#6b7280" }} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value} categorías`, "Total"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {kpis.porGrupo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Imagen</th>
                <th className="text-left p-4 font-semibold text-gray-600">Nombre</th>
                <th className="text-left p-4 font-semibold text-gray-600">Grupo</th>
                <th className="text-left p-4 font-semibold text-gray-600">Descripción</th>
                <th className="text-left p-4 font-semibold text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((category) => (
                <tr key={category.id_Categoria} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={getCategoryImgSrc(category)}
                        alt={category.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getCategoryPlaceholder({ categoria: { nombre: category.nombre, grupo: category.grupo } }, 80, 60);
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900">{category.nombre}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {category.grupo ? (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {category.grupo}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600 max-w-[200px] truncate">{category.descripcion || "-"}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        aria-label="Editar categoría"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => removeCategory(category.id_Categoria)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        aria-label="Eliminar categoría"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-gray-500" colSpan={5}>
                    <FolderTree size={32} className="text-gray-300 mx-auto mb-2" />
                    <p>No se encontraron categorías.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FolderTree size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">{editingId ? "Editar Categoría" : "Crear Categoría"}</h2>
              </div>
              <button
                onClick={() => { setShowModal(false); setForm(initialForm); setEditingId(null); }}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ID (opcional)</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={form.id_Categoria}
                      onChange={(e) => setForm((prev) => ({ ...prev, id_Categoria: e.target.value }))}
                      placeholder="ID personalizado"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.nombre}
                    onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre de la categoría"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Grupo</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.grupo}
                    onChange={(e) => setForm((prev) => ({ ...prev, grupo: e.target.value }))}
                  >
                    <option value="">Seleccionar grupo</option>
                    {grupos.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="__new__">+ Nuevo grupo</option>
                  </select>
                  {form.grupo === "__new__" && (
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={form._newGrupo || ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, _newGrupo: e.target.value }))}
                      placeholder="Nombre del nuevo grupo"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={form.descripcion}
                    onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción de la categoría"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen URL (opcional)</label>
                  <div className="flex items-center gap-3">
                    <ImageIcon size={18} className="text-gray-400 flex-shrink-0" />
                    <input
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={form.imagen}
                      onChange={(e) => setForm((prev) => ({ ...prev, imagen: e.target.value }))}
                      placeholder="https://... o ruta de storage"
                    />
                  </div>

                  {/* Preview en vivo */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Eye size={12} /> Preview
                    </p>
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {form.imagen && !imgError ? (
                        <img
                          key={form.imagen}
                          src={resolveImageUrl(form.imagen)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <img
                          src={getCategoryPlaceholder({
                            categoria: {
                              nombre: form.nombre || "Categoría",
                              grupo: form.grupo !== "__new__" ? form.grupo : (form._newGrupo || ""),
                            }
                          }, 400, 128)}
                          alt="Placeholder"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {form.imagen && imgError && (
                      <p className="text-xs text-red-500 mt-1">No se pudo cargar la imagen. Se mostrará el placeholder.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setForm(initialForm); setEditingId(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {editingId ? "Actualizar" : "Crear Categoría"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
