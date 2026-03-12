import { useEffect, useState, useMemo } from "react";
import { Briefcase, MapPin, User, Search, Filter, X, ChevronDown, Star, Clock, ChevronRight, Eye, Calendar } from "lucide-react";
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
  const [selectedItem, setSelectedItem] = useState(null);

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

      // Fetch servicios - siempre filtrar solo servicios
      const servicesRes = await fetch(`${API_URL}/servicios/explore?tipo=servicio`, { headers });
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
        // Tipo 'solicitante': el usuario solicita un servicio a un ofertante
        // El solicitante paga al proveedor (ofertante del servicio)
        body: JSON.stringify({ 
          id_Servicio: service.id_Servicio, 
          mensaje,
          tipo_postulacion: 'solicitante' 
        }),
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
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Explorar Servicios</h1>
        <p className="text-gray-500 mt-2 text-lg">Descubre servicios profesionales ofrecidos por la comunidad</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Input de búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar servicios por título, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
            />
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border transition-all font-medium ${
              showFilters || selectedGrupo || selectedCategoria
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter size={18} />
            <span>Filtros</span>
            {(selectedGrupo || selectedCategoria) && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
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
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Imagen del servicio */}
                  <div className="h-52 relative overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={service.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = getCategoryFallbackImage(categoryName);
                      }}
                    />
                    {/* Overlay con gradiente */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    
                    {/* Badge de categoría */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                        {categoryName}
                      </span>
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-2">
                      {service.titulo}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                      {service.descripcion || "Sin descripción."}
                    </p>
                    
                    {/* Precio */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {service.precio ? `$${Number(service.precio).toLocaleString("es-CO")}` : "A convenir"}
                      </span>
                      {service.precio && <span className="text-sm text-gray-400 ml-1">COP</span>}
                    </div>
                    
                    {/* Información del ofertante y ubicación */}
                    <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <MapPin size={12} className="text-gray-500" />
                        </div>
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
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => setSelectedItem(service)}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300"
                      >
                        <Eye size={16} />
                        Detalles
                      </button>
                      <button
                        onClick={() => requestService(service)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl"
                      >
                        <Briefcase size={16} />
                        Solicitar
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
         </div>
       ) : (
         <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
           <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Search size={36} className="text-gray-400" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-3">No se encontraron servicios</h3>
           <p className="text-gray-500 mb-6 max-w-md mx-auto">
             {searchTerm || selectedCategoria
               ? "Intenta ajustar los filtros de búsqueda"
               : "No hay servicios disponibles en este momento"}
           </p>
           {(searchTerm || selectedCategoria) && (
             <button
               onClick={clearFilters}
               className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
             >
               Limpiar filtros
             </button>
           )}
         </div>
       )
     }
            : (
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
             )
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col">
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-full"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col lg:flex-row overflow-hidden">
              {/* Imagen - Lado izquierdo en PC */}
              <div className="lg:w-1/2 h-64 lg:h-auto relative">
                <img
                  src={selectedItem.imagen 
                    ? resolveImageUrl(selectedItem.imagen) 
                    : selectedItem.categoria?.imagen 
                      ? resolveImageUrl(selectedItem.categoria.imagen) 
                      : getCategoryFallbackImage(selectedItem.categoria?.nombre)}
                  alt={selectedItem.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"></div>
                {/* Badge de categoría en móvil */}
                <div className="absolute bottom-4 left-4 lg:hidden">
                  <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                    {selectedItem.categoria?.nombre || "General"}
                  </span>
                </div>
              </div>
              
              {/* Contenido - Lado derecho en PC */}
              <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto max-h-[70vh] lg:max-h-[90vh]">
                {/* Header */}
                <div className="mb-6">
                  <div className="hidden lg:flex items-center gap-2 mb-3">
                    <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                      {selectedItem.categoria?.nombre || "General"}
                    </span>
                    {selectedItem.estado && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedItem.estado === 'Activo' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                      }`}>
                        {selectedItem.estado}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{selectedItem.titulo}</h2>
                  <p className="text-gray-500 text-base leading-relaxed">
                    {selectedItem.descripcion || "Sin descripción disponible."}
                  </p>
                </div>
                
                {/* Precio destacado */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-100">
                  <p className="text-sm text-gray-500 mb-1">Precio del servicio</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {selectedItem.precio ? `$${Number(selectedItem.precio).toLocaleString("es-CO")}` : "A convenir"}
                  </p>
                  {selectedItem.precio && <p className="text-sm text-gray-500 mt-1">Pesos colombianos (COP)</p>}
                </div>
                
                {/* Información detallada */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Detalles del servicio</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Clock size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tiempo de entrega</p>
                        <p className="font-semibold text-gray-900">{selectedItem.tiempo_entrega || "A convenir"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <MapPin size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ubicación</p>
                        <p className="font-semibold text-gray-900">{selectedItem.cliente_usuario?.ciudad || "Remoto"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <User size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Publicado por</p>
                        <p className="font-semibold text-gray-900">{selectedItem.cliente_usuario?.nombre || "Anónimo"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Calendar size={18} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Publicado</p>
                        <p className="font-semibold text-gray-900">
                          {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString("es-CO", { day: 'numeric', month: 'short', year: 'numeric' }) : "最近"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      openPublicProfile(selectedItem?.cliente_usuario?.id_CorreoUsuario);
                      setSelectedItem(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors border border-gray-200"
                  >
                    <User size={18} />
                    Ver perfil
                  </button>
                  <button
                    onClick={() => {
                      requestService(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-200"
                  >
                    <Briefcase size={18} />
                    Solicitar servicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
       )};
       </div>
    );
}
