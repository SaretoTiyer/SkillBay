import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";

export default function Services({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-2" size={22} /> Cargando servicios...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <section className="bg-linear-to-br from-[#0f2744] via-[#1E3A5F] to-[#2B6CB0] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Categorias y Subcategorias</h1>
          <p className="text-blue-100">Explora servicios disponibles en la plataforma sin iniciar sesion.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedCategories).map(([groupName, items]) => (
            <article key={groupName} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">{groupName}</h2>
              <p className="text-sm text-slate-500 mb-4">
                {items.length} subcategorias disponibles.
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((subcategory) => (
                  <span key={subcategory.id_Categoria} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-full">
                    {subcategory.nombre}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Servicios publicados</h2>
            <button
              onClick={() => onNavigate("register")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Registrarse para contratar
            </button>
          </div>

          {services.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
              Aun no hay servicios publicados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {services.slice(0, 12).map((service) => (
                <article key={service.id_Servicio} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="h-40 bg-slate-100">
                    {service.imagen ? (
                      <img src={resolveImageUrl(service.imagen)} alt={service.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">Sin imagen</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 line-clamp-1">{service.titulo}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{service.descripcion || "Sin descripcion."}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">{service?.categoria?.nombre || "General"}</span>
                      <span className="text-sm font-semibold text-blue-700">
                        {service.precio ? `$${Number(service.precio).toLocaleString("es-CO")} COP` : "A convenir"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <button onClick={() => onNavigate("register")} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1E3A5F] text-white hover:bg-[#163050]">
              Crear cuenta para solicitar servicios
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
