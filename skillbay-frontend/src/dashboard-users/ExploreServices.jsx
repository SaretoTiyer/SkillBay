import { useEffect, useState, useMemo } from "react";
import { Briefcase, MapPin, User, Search, Filter, X, ChevronDown, Star, Clock, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";

// Paletas de colores para categorías sin imagen
const CATEGORY_PALETTES = {
  "Desarrollo Web": { start: "#0f766e", end: "#14b8a6", icon: "💻" },
  "Diseno Grafico": { start: "#4c1d95", end: "#a855f7", icon: "🎨" },
  "Diseño Grafico": { start: "#4c1d95", end: "#a855f7", icon: "🎨" },
  "Marketing Digital": { start: "#854d0e", end: "#f59e0b", icon: "📢" },
  "Consultoria": { start: "#1f2937", end: "#4b5563", icon: "💼" },
  "Desarrollo Movil": { start: "#1e3a8a", end: "#3b82f6", icon: "📱" },
  "Limpieza": { start: "#059669", end: "#34d399", icon: "🧹" },
  "Jardineria": { start: "#65a30d", end: "#a3e635", icon: "🌱" },
  "Plomeria": { start: "#0891b2", end: "#22d3ee", icon: "🔧" },
  "Electricidad": { start: "#ea580c", end: "#fb923c", icon: "⚡" },
  "Tutorias": { start: "#7c3aed", end: "#a78bfa", icon: "📚" },
  "Idiomas": { start: "#db2777", end: "#f472b6", icon: "🌍" },
  "Musica": { start: "#c026d3", end: "#e879f9", icon: "🎵" },
  "default": { start: "#0f172a", end: "#475569", icon: "🛠️" },
};

function buildCategoryFallback(label) {
  const palette = CATEGORY_PALETTES[label] || CATEGORY_PALETTES.default;
  const safeLabel = encodeURIComponent(label || "Servicio");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='${palette.start}'/><stop offset='100%' stop-color='${palette.end}'/></linearGradient></defs><rect width='800' height='600' fill='url(#g)'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='48' fill='white' font-weight='600'>${palette.icon}</text><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='24' fill='rgba(255,255,255,0.9)'>${decodeURIComponent(safeLabel)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getCategoryFallbackImage(categoryName) {
  return buildCategoryFallback(categoryName || "Servicio");
}

export default function ExploreServices() {
  const [services, setServices] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recientes");

  // Obtener categorías que tienen servicios asociados
  const categoriasConServicios = useMemo(() => {
    const categoriasMap = new Map();
    services.forEach((service) => {
      if (service.id_Categoria && service.categoria) {
        if (!categoriasMap.has(service.id_Categoria)) {
          categoriasMap.set(service.id_Categoria, service.categoria);
        }
      }
    });
    return Array.from(categoriasMap.values());
  }, [services]);

  // Obtener grupos únicos de categorías que tienen servicios
  const grupos = useMemo(() => {
    const gruposSet = new Set(categoriasConServicios.map((c) => c.grupo).filter(Boolean));
    return Array.from(gruposSet).sort();
  }, [categoriasConServicios]);

  // Obtener subcategorías del grupo seleccionado (solo las que tienen servicios)
  const subcategorias = useMemo(() => {
    if (!selectedGrupo) return [];
    return categoriasConServicios
      .filter((c) => c.grupo === selectedGrupo)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [selectedGrupo, categoriasConServicios]);

  // Filtrar servicios
  const filteredServices = useMemo(() => {
    let filtered = [...services];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.titulo?.toLowerCase().includes(term) ||
          s.descripcion?.toLowerCase().includes(term) ||
          s.categoria?.nombre?.toLowerCase().includes(term) ||
          s.cliente_usuario?.nombre?.toLowerCase().includes(term)
      );
    }

    // Filtrar por categoría específica
    if (selectedCategoria) {
      filtered = filtered.filter((s) => s.id_Categoria === selectedCategoria);
    }

    // Ordenar
    switch (sortBy) {
      case "precio_low":
        filtered.sort((a, b) => (a.precio || 0) - (b.precio || 0));
        break;
      case "precio_high":
        filtered.sort((a, b) => (b.precio || 0) - (a.precio || 0));
        break;
      case "recientes":
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  }, [services, searchTerm, selectedCategoria, sortBy]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      // Fetch servicios
      const servicesRes = await fetch(`${API_URL}/servicios/explore`, { headers });
      const servicesData = servicesRes.ok ? await servicesRes.json() : [];
      setServices(Array.isArray(servicesData) ? servicesData : []);

      // Fetch categorías
      const categoriasRes = await fetch(`${API_URL}/categorias`, { headers });
      const categoriasData = categoriasRes.ok ? await categoriasRes.json() : [];
      setCategorias(categoriasData.categorias || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGrupo("");
    setSelectedCategoria("");
    setSortBy("recientes");
  };

  const openPublicProfile = (idCorreo) => {
    if (!idCorreo) return;
    localStorage.setItem("profile_target_user", idCorreo);
    localStorage.setItem("currentView", "public_profile");
    window.location.reload();
  };

  const requestService = async (service) => {
    const { value: mensaje } = await Swal.fire({
      title: "Solicitar servicio",
      input: "textarea",
      inputLabel: "Mensaje para el ofertante",
      inputPlaceholder: "Describe lo que necesitas para este servicio...",
      inputAttributes: { maxlength: "2000" },
      showCancelButton: true,
      confirmButtonText: "Enviar solicitud",
      cancelButtonText: "Cancelar",
      preConfirm: (value) => {
        const text = String(value || "").trim();
        if (!text) {
          Swal.showValidationMessage("Debes escribir un mensaje para solicitar el servicio.");
          return false;
        }
        return text;
      },
    });

    if (!mensaje) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/postulaciones`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id_Servicio: service.id_Servicio, mensaje }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo enviar la solicitud.");
      Swal.fire("Enviado", "Tu solicitud de servicio fue enviada.", "success");
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo enviar la solicitud.", "error");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Explorar Servicios</h1>
        <p className="text-slate-500 mt-1">Descubre servicios profesionales ofrecidos por la comunidad</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Input de búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar servicios por título, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
              showFilters || selectedGrupo || selectedCategoria
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter size={18} />
            <span>Filtros</span>
            {(selectedGrupo || selectedCategoria) && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {(selectedGrupo ? 1 : 0) + (selectedCategoria ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros expandibles */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por grupo (categoría padre) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría Principal</label>
                <select
                  value={selectedGrupo}
                  onChange={(e) => {
                    setSelectedGrupo(e.target.value);
                    setSelectedCategoria("");
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  {grupos.map((grupo) => (
                    <option key={grupo} value={grupo}>
                      {grupo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por subcategoría */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {selectedGrupo ? "Subcategoría" : "Selecciona una categoría primero"}
                </label>
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  disabled={!selectedGrupo}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todas las subcategorías</option>
                  {subcategorias.map((sub) => (
                    <option key={sub.id_Categoria} value={sub.id_Categoria}>
                      {sub.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="precio_low">Menor precio</option>
                  <option value="precio_high">Mayor precio</option>
                </select>
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {(selectedGrupo || selectedCategoria || searchTerm || sortBy !== "recientes") && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X size={16} />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información de resultados */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-600">
          <span className="font-semibold text-slate-800">{filteredServices.length}</span> servicio
          {filteredServices.length !== 1 ? "s" : ""} encontrado
          {filteredServices.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid de servicios */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const categoryName = service?.categoria?.nombre || "General";
            const categoryImage = service?.categoria?.imagen;
            const imageSrc = service.imagen
              ? resolveImageUrl(service.imagen)
              : categoryImage
              ? resolveImageUrl(categoryImage)
              : getCategoryFallbackImage(categoryName);

            return (
              <article
                key={service.id_Servicio}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300 group"
              >
                {/* Imagen del servicio */}
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={service.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = getCategoryFallbackImage(categoryName);
                    }}
                  />
                  {/* Badge de categoría */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                      {categoryName}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {service.titulo}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">
                    {service.descripcion || "Sin descripción."}
                  </p>

                  {/* Precio */}
                  <div className="mt-3">
                    <span className="text-xl font-bold text-blue-600">
                      {service.precio ? `$${Number(service.precio).toLocaleString("es-CO")}` : "A convenir"}
                    </span>
                    {service.precio && <span className="text-sm text-slate-500 ml-1">COP</span>}
                  </div>

                  {/* Información del ofertante y ubicación */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin size={14} />
                      <span>{service?.cliente_usuario?.ciudad || "Remoto"}</span>
                    </div>
                    <button
                      onClick={() => openPublicProfile(service?.cliente_usuario?.id_CorreoUsuario)}
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <User size={14} />
                      <span>Ver perfil</span>
                    </button>
                  </div>

                  {/* Botones de acción */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => requestService(service)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Briefcase size={16} />
                      Solicitar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No se encontraron servicios</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || selectedCategoria
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay servicios disponibles en este momento"}
          </p>
          {(searchTerm || selectedCategoria) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
