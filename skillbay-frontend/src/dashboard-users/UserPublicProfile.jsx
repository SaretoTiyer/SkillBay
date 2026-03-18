import { useEffect, useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  User, 
  ChevronLeft,
  Send,
  Star,
  Package
} from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

export default function UserPublicProfile({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('servicios'); // servicios, oportunidades, reseñas

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
  const servicios = data.servicios || [];
  const oportunidades = data.oportunidades || [];
  const resenasComoOfertante = data.resenas_como_ofertante || [];
  const resenasComoCliente = data.resenas_como_cliente || [];
  
  // Filter only active services and opportunities
  const serviciosActivos = servicios.filter(s => s.estado === 'Activo');
  const oportunidadesActivas = oportunidades.filter(o => o.estado === 'Activo');
  
  // Calculate averages from backend data (placeholders since we're not getting real reviews yet)
  const promedioOfertante = data.resumen?.promedioOfertante || 0;
  const promedioCliente = data.resumen?.promedioCliente || 0;
  const promedioGeneral = ((promedioOfertante * resenasComoOfertante.length) + (promedioCliente * resenasComoCliente.length)) / 
                         (resenasComoOfertante.length + resenasComoCliente.length) || 0;

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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

  const postular = async (service) => {
    const { value: mensaje } = await Swal.fire({
      title: "Enviar postulación",
      input: "textarea",
      inputLabel: "Mensaje de postulación",
      inputPlaceholder: "Explica por qué eres una buena opción para esta oportunidad...",
      inputAttributes: { maxlength: "2000" },
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
          tipo_postulacion: 'postulante' 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo registrar la postulación.");
      Swal.fire("Enviado", "Tu postulación fue enviada.", "success");
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo enviar la postulación.", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
          <ChevronLeft size={16} />
          Volver
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-5">
          {/* Avatar with Initials */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {getInitials(user.nombre)}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{user.nombre} {user.apellido}</h1>
            <p className="mt-1 text-sm text-slate-600 capitalize">{user.rol}</p>
            <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
              <MapPin size={14} />
              <span>{user.ciudad || "Remoto"}</span>
              {user.departamento && <span className="mx-2 text-slate-400">/</span>}
              <span>{user.departamento || ""}</span>
            </p>
          </div>
          
          {/* Stats */}
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Star size={16} className="text-yellow-400" />
              <span className="text-slate-600">{promedioGeneral.toFixed(1)}</span>
            </div>
            <p className="text-xs text-slate-500">Calificación promedio</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6 bg-white rounded-2xl border border-slate-200 p-4">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">Total publicados</p>
          <p className="text-2xl font-bold text-slate-800">{servicios.length + oportunidades.length}</p>
        </div>
        <div className="text-center border-l border-r border-slate-100 py-4">
          <p className="text-sm font-medium text-slate-500">Activos</p>
          <p className="text-2xl font-bold text-slate-800">{serviciosActivos.length + oportunidadesActivas.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">Calificación</p>
          <div className="flex items-center justify-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={16} 
                className={`${promedioGeneral >= star ? 'text-yellow-400' : 'text-slate-300'} mr-0.5`}
              />
            ))}
            <span className="ml-2 text-sm text-slate-600">{promedioGeneral.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-slate-200 rounded-t-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveTab('servicios')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'servicios' 
                ? 'bg-white text-slate-800 border-b-2 border-blue-500' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Servicios ({serviciosActivos.length})
          </button>
          <button
            onClick={() => setActiveTab('oportunidades')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'oportunidades' 
                ? 'bg-white text-slate-800 border-b-2 border-emerald-500' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Oportunidades ({oportunidadesActivas.length})
          </button>
          <button
            onClick={() => setActiveTab('reseñas')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'reseñas' 
                ? 'bg-white text-slate-800 border-b-2 border-purple-500' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Reseñas ({resenasComoOfertante.length + resenasComoCliente.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'servicios' && (
        <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-4">
          {serviciosActivos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {serviciosActivos.map((servicio) => (
                <article 
                  key={servicio.id_Servicio} 
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="h-48 relative overflow-hidden">
                    {servicio.imagen ? (
                      <img
                        src={servicio.imagen}
                        alt={servicio.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Package size={32} className="text-white" />
                        <p className="mt-2 text-sm text-white text-center">{servicio.categoria?.nombre || 'Servicio'}</p>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        servicio.estado === 'Activo' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : servicio.estado === 'Inactivo' 
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {servicio.estado}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors">
                      {servicio.titulo}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                      {servicio.descripcion}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Briefcase size={14} /> 
                        {servicio.precio ? `$${Number(servicio.precio).toLocaleString("es-CO")}` : "A convenir"}
                      </p>
                    </div>
                    <button
                      onClick={() => requestService(servicio)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <Send size={16} />
                      Solicitar servicio
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">Este usuario no tiene servicios activos publicados.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'oportunidades' && (
        <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-4">
          {oportunidadesActivas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {oportunidadesActivas.map((oportunidad) => (
                <article 
                  key={oportunidad.id_Servicio} 
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="h-48 relative overflow-hidden">
                    {oportunidad.imagen ? (
                      <img
                        src={oportunidad.imagen}
                        alt={oportunidad.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Package size={32} className="text-white" />
                        <p className="mt-2 text-sm text-white text-center">{oportunidad.categoria?.nombre || 'Oportunidad'}</p>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        oportunidad.estado === 'Activo' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : oportunidad.estado === 'Inactivo' 
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {oportunidad.estado}
                      </span>
                    </div>
                    {/* Opportunity Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        💼 Oportunidad
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors">
                      {oportunidad.titulo}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                      {oportunidad.descripcion}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Send size={14} /> 
                        {oportunidad.precio ? `$${Number(oportunidad.precio).toLocaleString("es-CO")}` : "A convenir"}
                      </p>
                    </div>
                    <button
                      onClick={() => postular(oportunidad)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <Send size={16} />
                      Postularme
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">Este usuario no tiene oportunidades activas publicadas.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reseñas' && (
        <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-4">
          {(resenasComoOfertante.length + resenasComoCliente.length) > 0 ? (
            <div className="space-y-6">
              {/* Reviews as Ofertante */}
              {resenasComoOfertante.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Reseñas recibidas como ofertante ({resenasComoOfertante.length})
                  </h3>
                  <div className="space-y-4">
                    {resenasComoOfertante.map((resena) => (
                      <div key={resena.id || Math.random()} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                            {getInitials(resena.autor_nombre || 'U')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800">{resena.autor_nombre || 'Usuario Anónimo'}</h4>
                            <p className="text-sm text-slate-600">{resena.servicio_titulo || 'Servicio no especificado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={14} 
                              className={`${star <= resena.estrellas ? 'text-yellow-400' : 'text-slate-300'} mr-0.5`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-slate-600">{resena.estrellas}/5</span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-4">{resena.comentario || 'Sin comentario'}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Reviews as Cliente */}
              {resenasComoCliente.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 mt-6">
                    Reseñas recibidas como cliente ({resenasComoCliente.length})
                  </h3>
                  <div className="space-y-4">
                    {resenasComoCliente.map((resena) => (
                      <div key={resena.id || Math.random()} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                            {getInitials(resena.autor_nombre || 'U')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800">{resena.autor_nombre || 'Usuario Anónimo'}</h4>
                            <p className="text-sm text-slate-600">{resena.servicio_titulo || 'Servicio no especificado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={14} 
                              className={`${star <= resena.estrellas ? 'text-yellow-400' : 'text-slate-300'} mr-0.5`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-slate-600">{resena.estrellas}/5</span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-4">{resena.comentario || 'Sin comentario'}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">Este usuario no tiene reseñas recibidas todavía.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}