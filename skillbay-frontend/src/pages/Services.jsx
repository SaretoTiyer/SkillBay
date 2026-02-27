import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, Search, Star, MapPin, User, Briefcase, CheckCircle } from "lucide-react";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";

// Paletas de colores para categorías
const CATEGORY_PALETTES = {
  "Desarrollo Web": { start: "#0f766e", end: "#14b8a6" },
  "Diseno Grafico": { start: "#4c1d95", end: "#a855f7" },
  "Diseño Grafico": { start: "#4c1d95", end: "#a855f7" },
  "Marketing Digital": { start: "#854d0e", end: "#f59e0b" },
  "Consultoria": { start: "#1f2937", end: "#4b5563" },
  "default": { start: "#0f172a", end: "#475569" },
};

function buildCategoryFallback(label) {
  const palette = CATEGORY_PALETTES[label] || CATEGORY_PALETTES.default;
  const safeLabel = encodeURIComponent(label || "Servicio");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='${palette.start}'/><stop offset='100%' stop-color='${palette.end}'/></linearGradient></defs><rect width='800' height='600' fill='url(#g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='32' fill='rgba(255,255,255,0.9)'>${decodeURIComponent(safeLabel)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function Services({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    loadPublicData();
  }, []);

  const loadPublicData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        fetch(`${API_URL}/categorias/publicas`, { headers: { Accept: "application/json" } }),
        fetch(`${API_URL}/servicios/public`, { headers: { Accept: "application/json" } }),
      ]);

      const categoriesData = await categoriesRes.json();
      const servicesData = await servicesRes.json();

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error("Error loading public services:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Filtrar servicios
  const filteredServices = useMemo(() => {
    let filtered = services;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.titulo?.toLowerCase().includes(term) ||
          s.descripcion?.toLowerCase().includes(term) ||
          s.categoria?.nombre?.toLowerCase().includes(term)
      );
    }

    return filtered.slice(0, 12);
  }, [services, searchTerm]);

  const handleRegisterClick = () => {
    if (onNavigate) {
      onNavigate("register");
    }
  };

  const handleLoginClick = () => {
    if (onNavigate) {
      onNavigate("login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-500">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Encuentra el servicio perfecto para tus necesidades
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Explora cientos de servicios profesionales ofrecidos por expertos en la plataforma
          </p>

          {/* Buscador público */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar servicios por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" bg-[#dfdfdf] w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
          </div>

          {/* CTA para visitantes */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRegisterClick}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              Crear cuenta
              <ArrowRight size={18} />
            </button>
            <button
              onClick={handleLoginClick}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Categorías</h2>
        </div>

        {/* Filtro de grupos */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => setSelectedGroup("")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedGroup === ""
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Todas
          </button>
          {grupos.map((grupo) => (
            <button
              key={grupo}
              onClick={() => setSelectedGroup(grupo)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedGroup === grupo
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {grupo}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedCategories)
            .filter(([group]) => !selectedGroup || group === selectedGroup)
            .map(([groupName, items]) => (
              <article key={groupName} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-slate-800 mb-3">{groupName}</h2>
                <p className="text-sm text-slate-500 mb-4">
                  {items.length} {items.length === 1 ? "subcategoría" : "subcategorías"} disponibles
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((subcategory) => (
                    <span
                      key={subcategory.id_Categoria}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {subcategory.nombre}
                    </span>
                  ))}
                </div>
              </article>
            ))}
        </div>
      </section>

      {/* Servicios */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Servicios Disponibles
              <span className="text-lg font-normal text-slate-500 ml-2">({services.length})</span>
            </h2>
          </div>

          {filteredServices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No se encontraron servicios</h3>
              <p className="text-slate-500">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Aún no hay servicios publicados en la plataforma"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredServices.map((service) => {
                const categoryName = service?.categoria?.nombre || "General";
                const categoryImage = service?.categoria?.imagen;
                const imageSrc = service.imagen
                  ? resolveImageUrl(service.imagen)
                  : categoryImage
                  ? resolveImageUrl(categoryImage)
                  : buildCategoryFallback(categoryName);

                return (
                  <article
                    key={service.id_Servicio}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Imagen */}
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={service.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = buildCategoryFallback(categoryName);
                        }}
                      />
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
                        {service.descripcion || "Sin descripción"}
                      </p>

                      {/* Precio */}
                      <div className="mt-3">
                        <span className="text-xl font-bold text-blue-600">
                          {service.precio ? `$${Number(service.precio).toLocaleString("es-CO")}` : "A convenir"}
                        </span>
                        {service.precio && <span className="text-sm text-slate-500 ml-1">COP</span>}
                      </div>

                      {/* Información adicional */}
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

                      {/* CTA para visitantes */}
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <button
                          onClick={handleRegisterClick}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Briefcase size={16} />
                          Ver detalles y contratar
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-2">
                          <CheckCircle size={12} className="inline mr-1" />
                          Regístrate para contratar este servicio
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Banner de registro */}
          <div className="mt-12 bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">¿Ofreces servicios?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Únete a SkillBay y encuentra clientes que necesitan tus habilidades. Crea tu perfil y comienza a ofrecer tus servicios hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRegisterClick}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Crear cuenta gratis
              </button>
              <button
                onClick={handleLoginClick}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400 transition-colors"
              >
                Ya tengo cuenta
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
