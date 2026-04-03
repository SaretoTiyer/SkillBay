import { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, DollarSign, MapPin, Search, Star, Filter, X, User, Flag, Send, Eye, Clock, Calendar, Globe, CreditCard, ArrowDown } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { getOpportunityImage } from "../utils/serviceImages";
import { showSuccess, showError, showInputModal } from "../utils/swalHelpers";

export default function ExploreOpportunities() {
  const [query, setQuery] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedTipo] = useState("oportunidad");
  const [services, setServices] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recientes");
  const [selectedItem, setSelectedItem] = useState(null);
  const resultsRef = useRef(null);
  const searchInputRef = useRef(null);

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

  const grupos = useMemo(() => {
    const gruposSet = new Set(categoriasConServicios.map((c) => c.grupo).filter(Boolean));
    return Array.from(gruposSet).sort();
  }, [categoriasConServicios]);

  const subcategorias = useMemo(() => {
    if (!selectedGrupo) return [];
    return categoriasConServicios
      .filter((c) => c.grupo === selectedGrupo)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [selectedGrupo, categoriasConServicios]);

  const filteredServices = useMemo(() => {
    let filtered = [...services];

    if (query) {
      const term = query.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.titulo?.toLowerCase().includes(term) ||
          s.descripcion?.toLowerCase().includes(term) ||
          s.categoria?.nombre?.toLowerCase().includes(term) ||
          s.cliente_usuario?.nombre?.toLowerCase().includes(term)
      );
    }

    if (selectedCategoria) {
      filtered = filtered.filter((s) => s.id_Categoria === selectedCategoria);
    } else if (selectedGrupo) {
      filtered = filtered.filter((s) => s.categoria?.grupo === selectedGrupo);
    }

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
  }, [services, query, selectedCategoria, selectedGrupo, sortBy]);

  useEffect(() => {
    fetchData();
  }, [selectedTipo]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      let url = `${API_URL}/servicios/explore`;
      if (selectedTipo) {
        url += `?tipo=${selectedTipo}`;
      }

      const servicesRes = await fetch(url, { headers });
      const servicesData = servicesRes.ok ? await servicesRes.json() : [];
      setServices(Array.isArray(servicesData) ? servicesData : []);

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
    setQuery("");
    setSelectedGrupo("");
    setSelectedCategoria("");
    setSortBy("recientes");
  };

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    scrollToResults();
  };

  const openPublicProfile = (idCorreo) => {
    if (!idCorreo) return;
    localStorage.setItem("profile_target_user", idCorreo);
    localStorage.setItem("currentView", "public_profile");
    window.location.reload();
  };

  const postular = async (service) => {
    const { value: mensaje } = await showInputModal({
      title: "Enviar postulación",
      inputLabel: "Mensaje de postulación",
      inputPlaceholder: "Explica por qué eres una buena opción para esta oportunidad...",
      confirmText: "Enviar postulación",
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
        body: JSON.stringify({ 
          id_Servicio: service.id_Servicio, 
          mensaje,
          tipo_postulacion: 'postulante' 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo registrar la postulación.");
      showSuccess("Postulación enviada", "Tu postulación fue enviada correctamente.");
    } catch (error) {
      showError("Error al enviar", error.message || "No se pudo enviar la postulación.");
    }
  };

  const reportService = async (service) => {
    const { value: motivo } = await showInputModal({
      title: "Reportar servicio",
      inputLabel: "Motivo del reporte",
      inputPlaceholder: "Ej: contenido inapropiado, fraude, suplantación...",
      confirmText: "Enviar reporte",
      minLength: 10,
    });

    if (!motivo) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/reportes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id_Servicio: service.id_Servicio,
          id_Reportado: service?.cliente_usuario?.id_CorreoUsuario,
          motivo: motivo.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo enviar el reporte.");
      showSuccess("Reporte enviado", "Tu reporte ha sido registrado y será revisado por el administrador.");
    } catch (error) {
      showError("Error al reportar", error.message || "No se pudo enviar el reporte.");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Cargando oportunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Explorar Oportunidades</h1>
        <p className="text-gray-500 mt-2 text-lg">Descubre oportunidades de trabajo publicadas por otros usuarios</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar oportunidades por título, descripción o categoría..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  scrollToResults();
                }
              }}
              className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-200 hover:shadow-xl"
          >
            <Search size={18} />
            <span>Buscar</span>
          </button>

          <button
            type="button"
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
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {(selectedGrupo ? 1 : 0) + (selectedCategoria ? 1 : 0)}
              </span>
            )}
          </button>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="precio_low">Menor presupuesto</option>
                  <option value="precio_high">Mayor presupuesto</option>
                </select>
              </div>
            </div>

            {(selectedGrupo || selectedCategoria || query || sortBy !== "recientes") && (
              <div className="mt-4 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  <X size={16} />
                  Limpiar filtros
                </button>
              </div>
            )}
         </div>
       )}
      </div>

      <div ref={resultsRef} className="flex items-center justify-between mb-4">
        <p className="text-slate-600">
          <span className="font-semibold text-slate-800">{filteredServices.length}</span> oportunidad
          {filteredServices.length !== 1 ? "es" : ""} encontrada
          {filteredServices.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={scrollToResults}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowDown size={16} />
          Ir a resultados
        </button>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const categoryName = service?.categoria?.nombre || "General";
            const imageSrc = getOpportunityImage(service);
            
            return (
              <article
                key={service.id_Servicio}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
              >
                <div className="h-52 relative overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={service.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = getOpportunityImage({ ...service, imagen: null, categoria: { ...service.categoria, imagen: null } });
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                      {categoryName}
                    </span>
                  </div>
                  {service.urgencia && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                        service.urgencia === 'urgente' ? 'bg-red-500 text-white' :
                        service.urgencia === 'alta' ? 'bg-orange-500 text-white' :
                        service.urgencia === 'media' ? 'bg-yellow-500 text-gray-800' :
                        'bg-blue-500 text-white'
                      }`}>
                        {service.urgencia === 'urgente' ? 'Urgente' :
                         service.urgencia === 'alta' ? 'Alta' :
                         service.urgencia === 'media' ? 'Media' : 'Baja'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); reportService(service); }}
                        className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white hover:text-red-600 text-gray-500 transition-all"
                        aria-label="Reportar oportunidad"
                      >
                        <Flag size={14} />
                      </button>
                    </div>
                  )}
                  {!service.urgencia && (
                    <button
                      onClick={(e) => { e.stopPropagation(); reportService(service); }}
                      className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white hover:text-red-600 text-gray-500 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Reportar oportunidad"
                    >
                      <Flag size={14} />
                    </button>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-2">
                    {service.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {service.descripcion || "Sin descripción."}
                  </p>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {service.precio ? `$${Number(service.precio).toLocaleString("es-CO")}` : "A convenir"}
                    </span>
                    {service.precio && <span className="text-sm text-gray-400 ml-1">COP</span>}
                  </div>
                  
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
                  
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => setSelectedItem(service)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300"
                    >
                      <Eye size={16} />
                      Detalles
                    </button>
                    <button
                      onClick={() => postular(service)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl"
                    >
                      <Send size={16} />
                      Postular
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Search size={36} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No se encontraron oportunidades</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {query || selectedCategoria || selectedGrupo
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay oportunidades disponibles en este momento"}
          </p>
          {(query || selectedCategoria || selectedGrupo) && (
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-full"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col lg:flex-row overflow-hidden">
              <div className="lg:w-1/2 h-64 lg:h-auto relative">
                <img
                  src={getOpportunityImage(selectedItem)}
                  alt={selectedItem.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent lg:hidden"></div>
                <div className="absolute bottom-4 left-4 lg:hidden">
                  <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                    {selectedItem.categoria?.nombre || "General"}
                  </span>
                </div>
              </div>
              
              <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto max-h-[70vh] lg:max-h-[90vh]">
                <div className="mb-6">
                  <div className="hidden lg:flex items-center gap-2 mb-3 flex-wrap">
                    <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                      {selectedItem.categoria?.nombre || "General"}
                    </span>
                    {selectedItem.urgencia && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedItem.urgencia === 'urgente' ? 'bg-red-100 text-red-700' :
                        selectedItem.urgencia === 'alta' ? 'bg-orange-100 text-orange-700' :
                        selectedItem.urgencia === 'media' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedItem.urgencia === 'urgente' ? 'Urgente' :
                         selectedItem.urgencia === 'alta' ? 'Alta prioridad' :
                         selectedItem.urgencia === 'media' ? 'Media prioridad' : 'Baja prioridad'}
                      </span>
                    )}
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
                
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-100">
                  <p className="text-sm text-gray-500 mb-1">Presupuesto disponible</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {selectedItem.precio ? `$${Number(selectedItem.precio).toLocaleString("es-CO")}` : "A convenir"}
                  </p>
                  {selectedItem.precio && <p className="text-sm text-gray-500 mt-1">Pesos colombianos (COP)</p>}
                </div>
                
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Detalles de la oportunidad</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Clock size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fecha límite</p>
                        <p className="font-semibold text-gray-900">{selectedItem.tiempo_entrega || "A convenir"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <MapPin size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ubicación</p>
                        <p className="font-semibold text-gray-900">{selectedItem.ubicacion || selectedItem.cliente_usuario?.ciudad || "Remoto"}</p>
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
                          {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString("es-CO", { day: 'numeric', month: 'short', year: 'numeric' }) : "Fecha desconocida"}
                        </p>
                      </div>
                    </div>

                    {selectedItem.modo_trabajo && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <Globe size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Modo de trabajo</p>
                          <p className="font-semibold text-gray-900">
                            {selectedItem.modo_trabajo === 'virtual' ? 'Virtual' : 
                             selectedItem.modo_trabajo === 'presencial' ? 'Presencial' : 
                             selectedItem.modo_trabajo === 'mixto' ? 'Mixto' : selectedItem.modo_trabajo}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedItem.metodos_pago && selectedItem.metodos_pago.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <CreditCard size={18} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Métodos de pago</p>
                          <p className="font-semibold text-gray-900">
                            {Array.isArray(selectedItem.metodos_pago) 
                              ? selectedItem.metodos_pago.map(m => {
                                if (m === 'tarjeta') return 'Tarjeta';
                                if (m === 'nequi') return 'Nequi';
                                if (m === 'bancolombia_qr') return 'QR Bancolombia';
                                if (m === 'efectivo') return 'Efectivo';
                                return m;
                              }).join(', ')
                              : selectedItem.metodos_pago}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
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
                      postular(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-200"
                  >
                    <Send size={18} />
                    Postularme
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
