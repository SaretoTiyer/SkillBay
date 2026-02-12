import { useEffect, useMemo, useState } from "react";
import { Briefcase, DollarSign, MapPin, Search, Star } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

export default function ExploreOpportunities() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/servicios/explore`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error explore opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const all = services
      .map((service) => service?.categoria?.nombre)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return ["all", ...Array.from(new Set(all))];
  }, [services]);

  const filteredServices = services.filter((service) => {
    const title = String(service.titulo || "").toLowerCase();
    const description = String(service.descripcion || "").toLowerCase();
    const category = service?.categoria?.nombre || "";
    const matchesQuery = title.includes(query.toLowerCase()) || description.includes(query.toLowerCase());
    const matchesCategory = selectedCategory === "all" || category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const postular = async (service) => {
    const { value: mensaje } = await Swal.fire({
      title: "Mensaje de postulacion",
      input: "textarea",
      inputLabel: `Postular a "${service.titulo}"`,
      inputPlaceholder: "Describe tu propuesta...",
      inputAttributes: { "aria-label": "Mensaje de postulacion" },
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
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
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "No se pudo registrar la postulacion.");
      }

      Swal.fire("Enviado", "Tu postulacion fue enviada.", "success");
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo enviar la postulacion.", "error");
    }
  };

  if (loading) {
    return <p className="text-slate-500">Cargando oportunidades...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Explorar Oportunidades</h1>
        <p className="text-[#64748B]">Encuentra servicios activos y postula tu propuesta.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input
            className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5"
            placeholder="Buscar por titulo o descripcion..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                selectedCategory === category ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {category === "all" ? "Todas" : category}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-4">Resultados: {filteredServices.length}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredServices.map((service) => (
          <article key={service.id_Servicio} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="h-44 bg-slate-100">
              {service.imagen ? (
                <img src={service.imagen} alt={service.titulo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Briefcase size={40} />
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-slate-800">{service.titulo}</h3>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{service?.categoria?.nombre || "General"}</span>
              </div>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{service.descripcion || "Sin descripcion."}</p>

              <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <DollarSign size={16} />
                  {service.precio ? `$${Number(service.precio).toLocaleString("es-CO")} COP` : "A convenir"}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} />
                  {service?.cliente_usuario?.ciudad || "Remoto"}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Star size={14} className="text-yellow-500" />
                  Publicado por {service?.cliente_usuario?.nombre || "Usuario"}
                </p>
                <button onClick={() => postular(service)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
                  Postularme
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 mt-4">
          No se encontraron oportunidades con esos filtros.
        </div>
      )}
    </div>
  );
}
