import { useEffect, useState } from "react";
import { Briefcase, MapPin, User } from "lucide-react";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function UserPublicProfile({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("profile_target_user");
    if (!id) {
      setLoading(false);
      return;
    }
    fetchProfile(id);
  }, []);

  const fetchProfile = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/usuarios/${encodeURIComponent(id)}/perfil`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      const payload = await response.json();
      setData(payload);
    } catch (error) {
      console.error("Error loading public profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-slate-500">Cargando perfil...</p>;
  if (!data?.usuario) return <p className="text-slate-500">No se encontro el perfil.</p>;

  const user = data.usuario;
  const services = data.servicios || [];

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={onBack} className="mb-4 text-sm text-blue-600">Volver</button>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{user.nombre} {user.apellido}</h1>
            <p className="text-sm text-slate-500">{user.rol} - Plan {user.id_Plan || "Sin plan"}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={14} /> {user.ciudad || "Ciudad no definida"}, {user.departamento || "Departamento no definido"}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-600">
          <p>Servicios totales: {data?.resumen?.totalServicios || 0}</p>
          <p>Servicios activos: {data?.resumen?.serviciosActivos || 0}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Servicios del usuario</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((service) => (
          <article key={service.id_Servicio} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="h-40 bg-slate-100">
              <ImageWithFallback src={resolveImageUrl(service.imagen)} alt={service.titulo} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-slate-800">{service.titulo}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{service.descripcion}</p>
              <p className="mt-2 text-sm text-slate-700 flex items-center gap-1">
                <Briefcase size={14} /> {service.estado}
              </p>
            </div>
          </article>
        ))}
        {services.length === 0 && <p className="text-sm text-slate-500">Este usuario no tiene servicios publicados.</p>}
      </div>
    </div>
  );
}
