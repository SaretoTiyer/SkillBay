import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2, Search, MapPin, User, Briefcase, CheckCircle, Rocket, Tag, Filter, X, TrendingUp, Layers, Star, Zap } from "lucide-react";
import { API_URL } from "../config/api";
import { getServiceImage, getOpportunityImage, getCategoryFallbackImage } from "../utils/serviceImages";

const GROUP_ICONS = {
  "Tecnologia": "💻",
  "Cuidado del Hogar": "🏠",
  "Educacion": "📚",
  "Servicios Generales": "💼",
  "Eventos": "🎉",
  "Oficios Manuales": "🔧",
};

export default function Services({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9);
  const [activeTab, setActiveTab] = useState("servicios");
  const [searchFocused, setSearchFocused] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    loadPublicData();
  }, []);

  useEffect(() => {
    if (selectedCategory || selectedGroup || searchTerm) {
      setVisibleCount(9);
    }
  }, [selectedCategory, selectedGroup, searchTerm]);

  useEffect(() => {
    if (selectedCategory || selectedGroup) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedCategory, selectedGroup, activeTab]);

  const loadPublicData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        fetch(`${API_URL}/categorias/publicas`, { headers: { Accept: "application/json" } }),
        fetch(`${API_URL}/servicios/public`, { headers: { Accept: "application/json" } }),
      ]);

      const categoriesData = await categoriesRes.json();
      const servicesData = await servicesRes.json();

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setAllServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error("Error loading public services:", error);
    } finally {
      setLoading(false);
    }
  };

  const servicios = useMemo(() => allServices.filter((s) => s.tipo === "servicio"), [allServices]);
  const oportunidades = useMemo(() => allServices.filter((s) => s.tipo === "oportunidad"), [allServices]);

  const groupedCategories = useMemo(() => {
    const groups = {};
    categories.forEach((item) => {
      const groupName = item.grupo || "General";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    });
    return groups;
  }, [categories]);

  const grupos = useMemo(() => Object.keys(groupedCategories).sort(), [groupedCategories]);

  const currentItems = activeTab === "servicios" ? servicios : oportunidades;

  const filteredServices = useMemo(() => {
    let result = currentItems;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.titulo?.toLowerCase().includes(term) ||
        s.descripcion?.toLowerCase().includes(term) ||
        s.categoria?.nombre?.toLowerCase().includes(term) ||
        s.cliente_usuario?.nombre?.toLowerCase().includes(term) ||
        s.cliente_usuario?.ciudad?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      result = result.filter(s =>
        s.id_Categoria === selectedCategory.id ||
        s.categoria?.id_Categoria === selectedCategory.id ||
        s.categoria?.nombre?.toLowerCase() === selectedCategory.nombre.toLowerCase()
      );
    }

    if (selectedGroup) {
      const catIds = (groupedCategories[selectedGroup] || []).map(c => c.id_Categoria);
      result = result.filter(s =>
        catIds.includes(s.id_Categoria) || catIds.includes(s.categoria?.id_Categoria)
      );
    }

    return result;
  }, [currentItems, searchTerm, selectedCategory, selectedGroup, groupedCategories]);

  const handleRegisterClick = () => {
    if (onNavigate) onNavigate("register");
  };

  const handleLoginClick = () => {
    if (onNavigate) onNavigate("login");
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedGroup("");
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  const topCategories = Object.entries(groupedCategories)
    .map(([group, items]) => ({
      group,
      items,
      totalCount: items.reduce((sum, cat) => {
        return sum + currentItems.filter(s =>
          s.id_Categoria === cat.id_Categoria || s.categoria?.id_Categoria === cat.id_Categoria
        ).length;
      }, 0),
    }))
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 6);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-20 px-4">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <Briefcase className="text-blue-300" size={16} />
            <span className="text-sm">Plataforma de servicios profesionales</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Encuentra el servicio perfecto<br />
            <span className="text-blue-300">o tu proxima oportunidad</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Explora servicios profesionales y oportunidades de trabajo publicadas por expertos en la plataforma
          </p>

          {/* Buscador mejorado */}
          <div className="max-w-2xl mx-auto">
            <div className={`relative transition-all duration-300 ${searchFocused ? "scale-105" : ""}`}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por titulo, descripcion, categoria o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-white/10 backdrop-blur-md border border-white/20 w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-3 text-sm text-blue-200">
                {filteredServices.length} resultado{filteredServices.length !== 1 ? "s" : ""} para "{searchTerm}"
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRegisterClick}
              className="px-8 py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              Crear cuenta
              <ArrowRight size={18} />
            </button>
            <button
              onClick={handleLoginClick}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold transition-all"
            >
              Iniciar sesion
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 36C840 48 960 64 1080 68C1200 72 1320 64 1380 60L1440 56V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 inline-flex">
          <button
            onClick={() => { setActiveTab("servicios"); clearAllFilters(); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "servicios"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Briefcase size={18} />
            Servicios
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "servicios" ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
              {servicios.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab("oportunidades"); clearAllFilters(); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "oportunidades"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Rocket size={18} />
            Oportunidades
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "oportunidades" ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
              {oportunidades.length}
            </span>
          </button>
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Zap size={20} className="text-amber-500" />
              Categorías Destacadas
            </h2>
            <p className="text-sm text-slate-500 mt-1">Explora las categorías más populares</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {topCategories.map(({ group, items, totalCount }, idx) => {
            const gradients = [
              "from-blue-500 to-indigo-600",
              "from-emerald-500 to-teal-600",
              "from-purple-500 to-violet-600",
              "from-amber-500 to-orange-600",
              "from-cyan-500 to-sky-600",
              "from-rose-500 to-pink-600",
            ];
            const gradient = gradients[idx % gradients.length];
            const icon = GROUP_ICONS[group] || "📂";
            const catImage = items[0]?.imagen;
            const hasImage = catImage && catImage.startsWith('http');

            return (
              <button
                key={group}
                onClick={() => {
                  setSelectedGroup(group);
                  setSelectedCategory(null);
                  setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                }}
                className={`group relative overflow-hidden rounded-2xl p-4 text-white transition-all hover:scale-[1.02] hover:shadow-xl ${
                  selectedGroup === group ? "ring-4 ring-blue-400 ring-offset-2 scale-[1.02] shadow-xl" : ""
                }`}
              >
                {hasImage ? (
                  <div className="absolute inset-0">
                    <img src={catImage} alt={group} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
                )}
                <div className="relative h-24 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-lg">
                      {icon}
                    </div>
                    {totalCount > 0 && (
                      <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                        {totalCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight line-clamp-2">{group}</p>
                    <p className="text-xs text-white/70 mt-0.5">{items.length} subcategorías</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Todas las Categorías */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers size={18} className="text-slate-500" />
            Todas las Categorías
          </h2>
        </div>

        {/* Group filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedGroup("")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
              selectedGroup === ""
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Todas
          </button>
          {grupos.map((grupo) => (
            <button
              key={grupo}
              onClick={() => setSelectedGroup(grupo)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
                selectedGroup === grupo
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {grupo}
            </button>
          ))}
        </div>

        {/* Category cards con imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(groupedCategories)
            .filter(([group]) => !selectedGroup || group === selectedGroup)
            .map(([groupName, items], idx) => {
              const gradients = [
                "from-blue-500 to-indigo-600",
                "from-emerald-500 to-teal-600",
                "from-purple-500 to-violet-600",
                "from-amber-500 to-orange-600",
                "from-cyan-500 to-sky-600",
                "from-rose-500 to-pink-600",
              ];
              const gradient = gradients[idx % gradients.length];
              const icon = GROUP_ICONS[groupName] || "📂";
              const firstCatImage = items[0]?.imagen;
              const hasImage = firstCatImage && firstCatImage.startsWith('http');
              const totalItems = currentItems.filter(s =>
                items.some(cat => s.id_Categoria === cat.id_Categoria || s.categoria?.id_Categoria === cat.id_Categoria)
              ).length;

              return (
                <article 
                  key={groupName} 
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all"
                >
                  {/* Header con imagen o gradiente */}
                  <div className="h-24 relative overflow-hidden">
                    {hasImage ? (
                      <>
                        <img src={firstCatImage} alt={groupName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
                      </>
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl">
                          {icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">{groupName}</h3>
                          <p className="text-white/70 text-xs">{items.length} subcategorías</p>
                        </div>
                      </div>
                      {totalItems > 0 && (
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                          {totalItems} {activeTab === "servicios" ? "servicios" : "oportunidades"}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Subcategorías */}
                  <div className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {items.slice(0, 6).map((subcategory) => {
                        const count = currentItems.filter(s =>
                          s.id_Categoria === subcategory.id_Categoria || s.categoria?.id_Categoria === subcategory.id_Categoria
                        ).length;
                        return (
                          <span
                            key={subcategory.id_Categoria}
                            onClick={() => {
                              setSelectedCategory({ id: subcategory.id_Categoria, nombre: subcategory.nombre });
                              setVisibleCount(9);
                              setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
                            }}
                            className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1 ${
                              selectedCategory?.id === subcategory.id_Categoria
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700"
                            }`}
                          >
                            {subcategory.nombre}
                            {count > 0 && (
                              <span className={`text-xs ${selectedCategory?.id === subcategory.id_Categoria ? "text-white/70" : "text-slate-400"}`}>
                                ({count})
                              </span>
                            )}
                          </span>
                        );
                      })}
                      {items.length > 6 && (
                        <span className="px-2.5 py-1 text-xs text-slate-400 font-medium">
                          +{items.length - 6} más
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </section>

      {/* Items */}
      <section id="servicios-section" ref={resultsRef} className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === "servicios" ? "Servicios Disponibles" : "Oportunidades Disponibles"}
              <span className="text-lg font-normal text-slate-500 ml-2">({currentItems.length})</span>
            </h2>
          </div>

          {/* Active filters */}
          {(selectedCategory || selectedGroup || searchTerm) && (
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {selectedCategory && (
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Tag size={14} />
                  {selectedCategory.nombre}
                  <button onClick={() => setSelectedCategory(null)} className="ml-1 hover:text-blue-900 font-bold leading-none" aria-label="Quitar filtro">x</button>
                </span>
              )}
              {selectedGroup && (
                <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Filter size={14} />
                  {selectedGroup}
                  <button onClick={() => setSelectedGroup('')} className="ml-1 hover:text-slate-900 font-bold leading-none" aria-label="Quitar filtro">x</button>
                </span>
              )}
              {searchTerm && (
                <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Search size={14} />
                  &quot;{searchTerm}&quot;
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-amber-900 font-bold leading-none" aria-label="Quitar filtro">x</button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-auto">
                Limpiar filtros
              </button>
              <span className="text-sm text-slate-500">
                {filteredServices.length} resultado{filteredServices.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {filteredServices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Sin resultados</h3>
              <p className="text-slate-500 mb-5">
                {selectedCategory || selectedGroup || searchTerm
                  ? "Intenta ajustar los filtros de busqueda"
                  : `Aun no hay ${activeTab} publicados en la plataforma`}
              </p>
              {(selectedCategory || selectedGroup || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredServices.slice(0, visibleCount).map((service) => {
                const isServicio = service.tipo === "servicio";
                const catName = service?.categoria?.nombre || "";
                const imageSrc = isServicio ? getServiceImage(service) : getOpportunityImage(service);
                const fallbackSrc = getCategoryFallbackImage(catName, isServicio ? "service" : "opportunity");
                const isOportunidad = service.tipo === "oportunidad";

                return (
                  <article
                    key={service.id_Servicio}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={service.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = fallbackSrc; }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${
                          isServicio ? "bg-blue-500 text-white" : "bg-emerald-500 text-white"
                        }`}>
                          {isServicio ? "Servicio" : "Oportunidad"}
                        </span>
                        {catName && (
                          <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                            {catName}
                          </span>
                        )}
                      </div>

                      {isOportunidad && service.urgencia && (
                        <div className="absolute top-3 right-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            service.urgencia === 'urgente' ? 'bg-red-500 text-white' :
                            service.urgencia === 'alta' ? 'bg-orange-500 text-white' :
                            service.urgencia === 'media' ? 'bg-yellow-500 text-gray-800' :
                            'bg-blue-500 text-white'
                          }`}>
                            {service.urgencia === 'urgente' ? 'Urgente' :
                             service.urgencia === 'alta' ? 'Alta' :
                             service.urgencia === 'media' ? 'Media' : 'Baja'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-base font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {service.titulo}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">
                        {service.descripcion || "Sin descripcion"}
                      </p>

                      <div className="mt-3">
                        <span className={`text-lg font-bold ${isServicio ? "text-blue-600" : "text-emerald-600"}`}>
                          {service.precio ? `$${Number(service.precio).toLocaleString("es-CO")}` : "A convenir"}
                        </span>
                        {service.precio && <span className="text-xs text-slate-400 ml-1">COP</span>}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin size={14} />
                          <span>{service?.cliente_usuario?.ciudad || "Remoto"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <User size={14} />
                          <span>{service?.cliente_usuario?.nombre || "Usuario"}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <button
                          onClick={handleRegisterClick}
                          className={`w-full font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            isServicio
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {isServicio ? <Briefcase size={16} /> : <Rocket size={16} />}
                          {isServicio ? "Ver detalles y contratar" : "Ver detalles y postular"}
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                          <CheckCircle size={12} />
                          Registrame para {isServicio ? "contratar" : "postular"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {filteredServices.length > visibleCount && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisibleCount(prev => prev + 9)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm"
              >
                Ver mas {activeTab === "servicios" ? "servicios" : "oportunidades"}
                <span className="text-slate-400 text-sm">
                  ({filteredServices.length - visibleCount} restantes)
                </span>
              </button>
            </div>
          )}

          {/* Banner */}
          <div className="mt-12 bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            </div>
            <div className="relative">
              <h3 className="text-2xl font-bold mb-3">Ofreces servicios o buscas oportunidades?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Unete a SkillBay y encuentra clientes que necesitan tus habilidades o oportunidades para crecer profesionalmente.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRegisterClick}
                  className="px-8 py-3.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Crear cuenta gratis
                </button>
                <button
                  onClick={handleLoginClick}
                  className="px-8 py-3.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-colors border border-blue-400"
                >
                  Ya tengo cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
