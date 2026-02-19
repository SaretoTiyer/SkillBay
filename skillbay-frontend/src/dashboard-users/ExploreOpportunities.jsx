import { useEffect, useMemo, useState } from "react";
import { Briefcase, DollarSign, MapPin, Search, Star } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";

const OPPORTUNITY_DEFAULTS = {
  "Desarrollo Web": "#0f172a|#1d4ed8",
  "Diseno Grafico": "#1f2937|#ec4899",
  "Marketing Digital": "#14532d|#16a34a",
  "Consultoria": "#312e81|#6366f1",
  "Desarrollo Movil": "#7f1d1d|#ef4444",
  default: "#0f172a|#334155",
};

function buildCategoryFallback(label, palette) {
  const [start, end] = palette.split("|");
  const safeLabel = encodeURIComponent(label || "Oportunidad");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${start}'/><stop offset='100%' stop-color='${end}'/></linearGradient></defs><rect width='1200' height='800' fill='url(#g)'/><text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='54' fill='white'>${decodeURIComponent(safeLabel)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getOpportunityFallbackImage(categoryName) {
  const palette = OPPORTUNITY_DEFAULTS[categoryName] || OPPORTUNITY_DEFAULTS.default;
  return buildCategoryFallback(categoryName || "Oportunidad", palette);
}

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
      title: "Enviar postulaci�n",
      input: "textarea",
      inputLabel: "Mensaje de postulaci�n",
      inputPlaceholder: "Escribe por qu� eres una buena opci�n para esta oportunidad...",
      inputAttributes: {
        maxlength: "2000",
      },
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      preConfirm: (value) => {
        const text = String(value || "").trim();
        if (!text) {
          Swal.showValidationMessage("Debes escribir un mensaje para postularte.");
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
        body: JSON.stringify({
          id_Servicio: service.id_Servicio,
          mensaje,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "No se pudo registrar la postulaci�n.");
      }

      Swal.fire("Enviado", "Tu postulaci�n fue enviada.", "success");
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo enviar la postulaci�n.", "error");
    }
  };

  const openPublicProfile = (idCorreo) => {
    if (!idCorreo) return;
    localStorage.setItem("profile_target_user", idCorreo);
    localStorage.setItem("currentView", "public_profile");
    window.location.reload();
  };

  const reportService = async (service) => {
    const { value: motivo } = await Swal.fire({
      title: "Reportar servicio",
      input: "textarea",
      inputLabel: "Describe el motivo del reporte",
      inputPlaceholder: "Ej: contenido inapropiado, fraude, suplantacion...",
      showCancelButton: true,
      confirmButtonText: "Enviar reporte",
      cancelButtonText: "Cancelar",
    });
    if (!motivo || motivo.trim().length < 10) return;

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
      Swal.fire("Enviado", "Reporte registrado correctamente.", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const payFromOpportunity = async (service) => {
    const { value: formValues } = await Swal.fire({
      title: "Simular pago (origen postulacion)",
      html:
        `<input id="pay-ident" class="swal2-input" placeholder="Identificacion del cliente" />` +
        `<input id="pay-post" class="swal2-input" placeholder="ID postulacion (opcional)" />` +
        `<select id="pay-method" class="swal2-select"><option value="virtual">Pago virtual</option><option value="efectivo">Pago en efectivo</option></select>` +
        `<select id="pay-mode" class="swal2-select"><option value="virtual">Servicio virtual</option><option value="presencial">Servicio presencial</option></select>`,
      showCancelButton: true,
      confirmButtonText: "Registrar pago",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const identificacionCliente = document.getElementById("pay-ident")?.value?.trim();
        const idPost = document.getElementById("pay-post")?.value?.trim();
        const modalidadPago = document.getElementById("pay-method")?.value;
        const modalidadServicio = document.getElementById("pay-mode")?.value;
        if (!identificacionCliente) {
          Swal.showValidationMessage("Debes ingresar la identificacion del cliente.");
          return false;
        }
        return {
          identificacionCliente,
          modalidadPago,
          modalidadServicio,
          id_Postulacion: idPost ? Number(idPost) : null,
        };
      },
    });

    if (!formValues) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/pagos/servicio`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id_Servicio: service.id_Servicio,
          origenSolicitud: "postulacion",
          ...formValues,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo registrar el pago.");
      Swal.fire("Pago registrado", `Referencia: ${data?.pago?.referenciaPago || "-"}`, "success");
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo registrar el pago.", "error");
    }
  };

  if (loading) {
    return <p className="text-slate-500">Cargando oportunidades...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Explorar Oportunidades</h1>
        <p className="text-[#64748B]">Explora oportunidades publicadas por otros usuarios y env�a tu postulaci�n.</p>
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
        {filteredServices.map((service) => {
          const categoryName = service?.categoria?.nombre || "General";
          const imageSrc = service.imagen ? resolveImageUrl(service.imagen) : getOpportunityFallbackImage(categoryName);

          return (
            <article key={service.id_Servicio} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="h-44 bg-slate-100">
                {imageSrc ? (
                  <img src={imageSrc} alt={service.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Briefcase size={40} />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-slate-800">{service.titulo}</h3>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{categoryName}</span>
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

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 gap-2 flex-wrap">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    Publicado por{" "}
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => openPublicProfile(service?.cliente_usuario?.id_CorreoUsuario)}
                    >
                      {service?.cliente_usuario?.nombre || "Usuario"}
                    </button>
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => postular(service)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
                      Postular
                    </button>
                    <button onClick={() => payFromOpportunity(service)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm">
                      Pagar
                    </button>
                    <button onClick={() => reportService(service)} className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm">
                      Reportar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 mt-4">
          No se encontraron oportunidades con esos filtros.
        </div>
      )}
    </div>
  );
}
