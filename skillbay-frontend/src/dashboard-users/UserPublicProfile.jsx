import { useEffect, useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  ChevronLeft,
  Send,
  Star,
  Package,
  TrendingUp,
  Users,
  Award,
  MessageSquare
} from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import ReviewCard from "../components/ReviewCard";

export default function UserPublicProfile({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('servicios');

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Cargando perfil...</p>
      </div>
    </div>
  );
  if (!data?.usuario) return (
    <div className="text-center py-20">
      <p className="text-slate-500 text-lg">No se encontró el perfil.</p>
      <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
        ← Volver
      </button>
    </div>
  );

  const user = data.usuario;
  const servicios = data.servicios || [];
  const oportunidades = data.oportunidades || [];
  const resenasComoOfertante = data.resenas_como_ofertante || [];
  const resenasComoCliente = data.resenas_como_cliente || [];
  
  const serviciosActivos = servicios.filter(s => s.estado === 'Activo');
  const oportunidadesActivas = oportunidades.filter(o => o.estado === 'Activo');
  
  const promedioOfertante = data.resumen?.promedioOfertante || 0;
  const promedioCliente = data.resumen?.promedioCliente || 0;
  const totalResenas = resenasComoOfertante.length + resenasComoCliente.length;
  const promedioGeneral = totalResenas > 0
    ? ((promedioOfertante * resenasComoOfertante.length) + (promedioCliente * resenasComoCliente.length)) / totalResenas
    : 0;

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const renderStars = (rating, size = 16) => (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={size} 
          className={`${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );

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

  const tabs = [
    { id: 'servicios', label: 'Servicios', count: serviciosActivos.length, icon: Package, color: 'blue' },
    { id: 'oportunidades', label: 'Oportunidades', count: oportunidadesActivas.length, icon: TrendingUp, color: 'emerald' },
    { id: 'reseñas', label: 'Reseñas', count: totalResenas, icon: MessageSquare, color: 'purple' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
          aria-label="Volver atrás"
        >
          <ChevronLeft size={18} />
          Volver
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg shrink-0">
              {getInitials(user.nombre)}
            </div>

            {/* Name & Location */}
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.nombre} {user.apellido}</h1>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                <MapPin size={14} />
                <span>{user.ciudad || "Remoto"}{user.departamento ? `, ${user.departamento}` : ""}</span>
              </p>
            </div>

            {/* Rating Badge */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div>
                {renderStars(promedioGeneral, 18)}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{promedioGeneral.toFixed(1)}</p>
                <p className="text-xs text-gray-500">{totalResenas} reseña{totalResenas !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Package size={18} className="text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">{serviciosActivos.length}</p>
          </div>
          <p className="text-xs text-gray-500 font-medium">Servicios activos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp size={18} className="text-emerald-600" />
            <p className="text-2xl font-bold text-gray-900">{oportunidadesActivas.length}</p>
          </div>
          <p className="text-xs text-gray-500 font-medium">Oportunidades</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Award size={18} className="text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">{promedioOfertante > 0 ? promedioOfertante.toFixed(1) : '-'}</p>
          </div>
          <p className="text-xs text-gray-500 font-medium">Como ofertante</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users size={18} className="text-amber-600" />
            <p className="text-2xl font-bold text-gray-900">{promedioCliente > 0 ? promedioCliente.toFixed(1) : '-'}</p>
          </div>
          <p className="text-xs text-gray-500 font-medium">Como cliente</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const colorMap = {
            blue: isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
            emerald: isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
            purple: isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
          };
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${colorMap[tab.color]}`}
              aria-pressed={isActive}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
        {/* Servicios */}
        {activeTab === 'servicios' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Servicios ofrecidos</h3>
                <p className="text-sm text-gray-500 mt-1">Servicios publicados por este usuario</p>
              </div>
            </div>
            {serviciosActivos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {serviciosActivos.map((servicio) => (
                  <article 
                    key={servicio.id_Servicio} 
                    className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="h-44 relative overflow-hidden">
                      {servicio.imagen ? (
                        <img
                          src={servicio.imagen}
                          alt={servicio.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Package size={36} className="text-white/80" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-emerald-700 backdrop-blur-sm">
                          {servicio.estado}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {servicio.titulo}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                        {servicio.descripcion}
                      </p>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm font-bold text-blue-600">
                          {servicio.precio ? `$${Number(servicio.precio).toLocaleString("es-CO")}` : "A convenir"}
                        </p>
                        {servicio.categoria?.nombre && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {servicio.categoria.nombre}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => requestService(servicio)}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        <Send size={14} />
                        Solicitar servicio
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package size={28} className="text-gray-300" />
                </div>
                <h4 className="text-gray-900 font-semibold mb-2">Sin servicios activos</h4>
                <p className="text-gray-500 text-sm">Este usuario no tiene servicios publicados actualmente.</p>
              </div>
            )}
          </div>
        )}

        {/* Oportunidades */}
        {activeTab === 'oportunidades' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Oportunidades publicadas</h3>
              <p className="text-sm text-gray-500 mt-1">Necesidades y proyectos abiertos</p>
            </div>
            {oportunidadesActivas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {oportunidadesActivas.map((oportunidad) => (
                  <article 
                    key={oportunidad.id_Servicio} 
                    className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="h-44 relative overflow-hidden">
                      {oportunidad.imagen ? (
                        <img
                          src={oportunidad.imagen}
                          alt={oportunidad.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <TrendingUp size={36} className="text-white/80" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-emerald-700 backdrop-blur-sm">
                          Oportunidad
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-emerald-700 backdrop-blur-sm">
                          {oportunidad.estado}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {oportunidad.titulo}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                        {oportunidad.descripcion}
                      </p>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm font-bold text-emerald-600">
                          {oportunidad.precio ? `$${Number(oportunidad.precio).toLocaleString("es-CO")}` : "A convenir"}
                        </p>
                        {oportunidad.categoria?.nombre && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {oportunidad.categoria.nombre}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => postular(oportunidad)}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        <Send size={14} />
                        Postularme
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={28} className="text-gray-300" />
                </div>
                <h4 className="text-gray-900 font-semibold mb-2">Sin oportunidades activas</h4>
                <p className="text-gray-500 text-sm">Este usuario no tiene oportunidades publicadas actualmente.</p>
              </div>
            )}
          </div>
        )}

        {/* Reseñas */}
        {activeTab === 'reseñas' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reseñas y calificaciones</h3>
              <p className="text-sm text-gray-500 mt-1">Opiniones de otros usuarios sobre su trabajo</p>
            </div>

            {/* Como Ofertante */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Award size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Como proveedor de servicios</h4>
                  <p className="text-sm text-gray-500">{resenasComoOfertante.length} evaluacion{resenasComoOfertante.length !== 1 ? 'es' : ''}</p>
                </div>
                {promedioOfertante > 0 && (
                  <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                    {renderStars(promedioOfertante, 14)}
                    <span className="text-sm font-semibold text-blue-700">{promedioOfertante.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {resenasComoOfertante.length > 0 ? (
                <div className="space-y-3">
                  {resenasComoOfertante.map((review) => (
                    <ReviewCard key={review.id_Reseña || Math.random()} review={review} sectionRole="ofertante" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                  <p className="text-gray-400 text-sm">Sin evaluaciones como proveedor aún</p>
                </div>
              )}
            </div>

            {/* Como Cliente */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Como cliente</h4>
                  <p className="text-sm text-gray-500">{resenasComoCliente.length} evaluacion{resenasComoCliente.length !== 1 ? 'es' : ''}</p>
                </div>
                {promedioCliente > 0 && (
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg">
                    {renderStars(promedioCliente, 14)}
                    <span className="text-sm font-semibold text-amber-700">{promedioCliente.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {resenasComoCliente.length > 0 ? (
                <div className="space-y-3">
                  {resenasComoCliente.map((review) => (
                    <ReviewCard key={review.id_Reseña || Math.random()} review={review} sectionRole="cliente" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                  <p className="text-gray-400 text-sm">Sin evaluaciones como cliente aún</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
