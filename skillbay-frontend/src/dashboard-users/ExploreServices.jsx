import { useEffect, useState } from "react";
import { Briefcase, MapPin, User } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";

const SERVICE_DEFAULTS = {
  "Desarrollo Web": "#0f766e|#14b8a6",
  "Diseno Grafico": "#4c1d95|#a855f7",
  "Diseño Grafico": "#4c1d95|#a855f7",
  "Marketing Digital": "#854d0e|#f59e0b",
  "Consultoria": "#1f2937|#4b5563",
  "Desarrollo Movil": "#1e3a8a|#3b82f6",
  default: "#0f172a|#475569",
};

function buildCategoryFallback(label, palette) {
  const [start, end] = palette.split("|");
  const safeLabel = encodeURIComponent(label || "Servicio");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${start}'/><stop offset='100%' stop-color='${end}'/></linearGradient></defs><rect width='1200' height='800' fill='url(#g)'/><text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='54' fill='white'>${decodeURIComponent(safeLabel)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getServiceFallbackImage(categoryName) {
  const palette = SERVICE_DEFAULTS[categoryName] || SERVICE_DEFAULTS.default;
  return buildCategoryFallback(categoryName || "Servicio", palette);
}

export default function ExploreServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
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
      console.error("Error exploring services:", error);
    } finally {
      setLoading(false);
    }
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
      inputAttributes: {
        maxlength: "2000",
      },
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
        body: JSON.stringify({
          id_Servicio: service.id_Servicio,
          mensaje,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "No se pudo enviar la solicitud del servicio.");
      }

      Swal.fire("Enviado", "Tu solicitud de servicio fue enviada.", "success");
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo enviar la solicitud.", "error");
    }
  };

  if (loading) {
    return <p className="text-slate-500">Cargando servicios...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Explorar Servicios</h1>
        <p className="text-[#64748B]">Catalogo de servicios creados por otros usuarios para solicitar directamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {services.map((service) => {
          const categoryName = service?.categoria?.nombre || "General";
          const imageSrc = service.imagen ? resolveImageUrl(service.imagen) : getServiceFallbackImage(categoryName);

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
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{categoryName}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{service.descripcion || "Sin descripcion."}</p>
                <p className="text-sm text-slate-700 mt-2">{service.precio ? `$${Number(service.precio).toLocaleString("es-CO")} COP` : "A convenir"}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <p className="flex items-center gap-1"><MapPin size={13} /> {service?.cliente_usuario?.ciudad || "Remoto"}</p>
                  <button
                    onClick={() => openPublicProfile(service?.cliente_usuario?.id_CorreoUsuario)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <User size={13} /> Ver perfil
                  </button>
                </div>
                <button
                  onClick={() => requestService(service)}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg"
                >
                  Solicitar servicio
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 mt-4">
          No hay servicios para mostrar.
        </div>
      )}
    </div>
  );
}
