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
  MessageSquare,
  Flag,
  Calendar,
  Crown,
  CheckCircle,
} from "lucide-react";
import { showSuccess, showError, showInputModal } from "../utils/swalHelpers";
import { API_URL } from "../config/api";
import { getServiceImage, getOpportunityImage } from "../utils/serviceImages";
import ReviewCard from "../components/ReviewCard";

// ============================================
// SKELETON COMPONENTS
// ============================================

function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button Skeleton */}
      <div className="mb-6">
        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Profile Header Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        <div className="h-32 bg-gray-200 animate-pulse" />
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
            <div className="flex-1 pb-1 space-y-2">
              <div className="h-7 w-48 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-36 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="h-14 w-32 bg-gray-200 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full mx-auto mb-2" />
            <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mx-auto" />
            <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mx-auto mt-1" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 w-28 bg-gray-200 animate-pulse rounded-xl" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <div className="h-44 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENTS
// ============================================

function EmptyState(props) {
  const { title, description, color = "gray" } = props;
  const IconComponent = props.icon;
  const colorClasses = {
    gray: "bg-gray-100 text-gray-300",
    blue: "bg-blue-50 text-blue-300",
    emerald: "bg-emerald-50 text-emerald-300",
    purple: "bg-purple-50 text-purple-300",
  };

  return (
    <div className="text-center py-16 px-4">
      <div className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        <IconComponent size={28} />
      </div>
      <h4 className="text-gray-900 font-semibold mb-2">{title}</h4>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">{description}</p>
    </div>
  );
}

// ============================================
// SERVICE/OPPORTUNITY CARD
// ============================================

function ServiceCard({ service, onAction, actionLabel, actionColor = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
  };

  const getImage = service.esOportunidad ? getOpportunityImage : getServiceImage;

  return (
    <article className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-300">
      <div className="h-44 relative overflow-hidden">
        {service.imagen ? (
          <img
            src={getImage(service)}
            alt={service.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = getImage({ ...service, imagen: null }); }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            service.esOportunidad 
              ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
          }`}>
            <Package size={36} className="text-white/80" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
            {service.estado}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {service.titulo}
        </h4>
        <p className="text-sm text-gray-500 line-clamp-2 mt-2">
          {service.descripcion}
        </p>
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
          <p className={`text-sm font-bold ${
            service.esOportunidad ? "text-emerald-600" : "text-blue-600"
          }`}>
            {service.precio ? `$${Number(service.precio).toLocaleString("es-CO")}` : "A convenir"}
          </p>
          {service.categoria?.nombre && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {service.categoria.nombre}
            </span>
          )}
        </div>
        <button
          onClick={() => onAction(service)}
          className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 ${colorClasses[actionColor]} text-white font-semibold rounded-lg transition-colors text-sm`}
        >
          <Send size={14} />
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

// ============================================
// REVIEW TABS COMPONENT
// ============================================

function ReviewTabsComponent({ ofertanteReviews, clienteReviews, promedioOfertante, promedioCliente }) {
  const [activeReviewTab, setActiveReviewTab] = useState('ofertante');

  const tabs = [
    { 
      id: 'ofertante', 
      label: 'Como Ofertante', 
      count: ofertanteReviews.length, 
      icon: Award, 
      color: 'blue',
      avg: promedioOfertante
    },
    { 
      id: 'cliente', 
      label: 'Como Cliente', 
      count: clienteReviews.length, 
      icon: Users, 
      color: 'amber',
      avg: promedioCliente
    },
  ];

  const activeReviews = activeReviewTab === 'ofertante' ? ofertanteReviews : clienteReviews;
  const activeAvg = activeReviewTab === 'ofertante' ? promedioOfertante : promedioCliente;

  return (
    <div className="space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const isActive = activeReviewTab === tab.id;
          const colorMap = {
            blue: isActive 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
            amber: isActive 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
          };
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReviewTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${colorMap[tab.color]}`}
            >
              <tab.icon size={16} />
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

      {/* Reviews Content */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        {/* Average */}
        {activeAvg > 0 && (
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={18} 
                  className={`${star <= Math.round(activeAvg) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xl font-bold text-gray-900">{activeAvg.toFixed(1)}</span>
            <span className="text-sm text-gray-500">promedio</span>
          </div>
        )}

        {activeReviews.length > 0 ? (
          <div className="space-y-3">
            {activeReviews.map((review) => (
              <ReviewCard key={review.id_Reseña || Math.random()} review={review} sectionRole={activeReviewTab} />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={MessageSquare} 
            title={`Sin reseñas como ${activeReviewTab === 'ofertante' ? 'ofertante' : 'cliente'}`}
            description={`Este usuario aún no ha recibido reseñas en esta categoría.`}
            color={activeReviewTab === 'ofertante' ? 'blue' : 'amber'}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function UserPublicProfile({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('servicios');
  const [profileImageError, setProfileImageError] = useState(false);

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

  const requestService = async (service) => {
    const { value: mensaje } = await showInputModal({
      title: "Solicitar servicio",
      inputLabel: "Mensaje para el ofertante",
      inputPlaceholder: "Describe lo que necesitas para este servicio...",
      confirmText: "Enviar solicitud",
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

      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "No se pudo enviar la solicitud.");
      showSuccess("Enviado", "Tu solicitud de servicio fue enviada.");
    } catch (error) {
      showError("Error", error.message || "No se pudo enviar la solicitud.");
    }
  };

  const postular = async (service) => {
    const { value: mensaje } = await showInputModal({
      title: "Enviar postulación",
      inputLabel: "Mensaje de postulación",
      inputPlaceholder: "Explica por qué eres una buena opción para esta oportunidad...",
      confirmText: "Enviar",
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

      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "No se pudo registrar la postulación.");
      showSuccess("Enviado", "Tu postulación fue enviada.");
    } catch (error) {
      showError("Error", error.message || "No se pudo enviar la postulación.");
    }
  };

  const reportUser = async () => {
    const { value: motivo } = await showInputModal({
      title: "Reportar usuario",
      inputLabel: "Motivo del reporte",
      inputPlaceholder: "Ej: comportamiento inapropiado, fraude, suplantación...",
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
          id_Reportado: user.id_CorreoUsuario,
          motivo: motivo.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "No se pudo enviar el reporte.");
      showSuccess("Reporte enviado", "Tu reporte ha sido registrado y será revisado por el administrador.");
    } catch (error) {
      showError("Error al reportar", error.message || "No se pudo enviar el reporte.");
    }
  };

  // Loading state
  if (loading) {
    return <ProfileSkeleton />;
  }

  // Not found state
  if (!data?.usuario) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users size={36} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Perfil no encontrado</h2>
        <p className="text-gray-500 mb-6">El usuario que buscas no existe o ha sido eliminado.</p>
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          <ChevronLeft size={18} />
          Volver
        </button>
      </div>
    );
  }

  const user = data.usuario;
  const servicios = data.servicios || [];
  const oportunidades = data.oportunidades || [];
  const resenasComoOfertante = data.resenas_como_ofertante || [];
  const resenasComoCliente = data.resenas_como_cliente || [];

  // Filter active/completed items
  const serviciosActivos = servicios.filter(s => s.estado === 'Activo' || s.estado === 'Completado');
  const oportunidadesActivas = oportunidades.filter(o => o.estado === 'Activo' || o.estado === 'Completado');

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

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-CO", {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getRoleLabel = (rol) => {
    const roles = {
      ofertante: "Ofertante",
      cliente: "Cliente",
      admin: "Administrador",
    };
    return roles[rol?.toLowerCase()] || rol || "Usuario";
  };

  const getRoleBadgeColor = (rol) => {
    const colors = {
      ofertante: "bg-blue-100 text-blue-700 border-blue-200",
      cliente: "bg-amber-100 text-amber-700 border-amber-200",
      admin: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[rol?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Render stars helper
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

  const tabs = [
    { id: 'servicios', label: 'Servicios', count: serviciosActivos.length, icon: Package, color: 'blue' },
    { id: 'oportunidades', label: 'Oportunidades', count: oportunidadesActivas.length, icon: TrendingUp, color: 'emerald' },
    { id: 'reseñas', label: 'Reseñas', count: totalResenas, icon: MessageSquare, color: 'purple' },
  ];

  // Check if user has active plan
  const hasActivePlan = user.plan?.estado === 'Activo';
  const planName = user.plan?.nombre || user.plan?.nombrePlan;

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

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDEBAR - User Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm sticky top-8">
            {/* Cover */}
            <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 -mt-10 relative">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg mx-auto relative overflow-hidden">
                  {user.imagen_perfil && !profileImageError ? (
                    <img
                      src={`${API_URL.replace('/api', '')}/storage/${user.imagen_perfil}`}
                      alt={`${user.nombre}'s profile`}
                      className="w-full h-full object-cover"
                      onError={() => setProfileImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      {getInitials(user.nombre)}
                    </div>
                  )}
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>

                {/* Name */}
                <h2 className="text-xl font-bold text-gray-900 mt-4">{user.nombre} {user.apellido}</h2>

                {/* Role Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border mt-2 ${getRoleBadgeColor(user.rol)}`}>
                  <Briefcase size={14} />
                  {getRoleLabel(user.rol)}
                </div>

                {/* Plan Badge - Only for ofertantes with active plan */}
                {hasActivePlan && user.rol?.toLowerCase() === 'ofertante' && (
                  <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                    <Crown size={18} className="text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">{planName}</span>
                    <CheckCircle size={14} className="text-emerald-500" />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-gray-100"></div>

              {/* Location & Date */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Ubicación</p>
                    <p className="text-sm text-gray-900">
                      {user.ciudad || "Remoto"}{user.departamento ? `, ${user.departamento}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Miembro desde</p>
                    <p className="text-sm text-gray-900">{formatDate(user.fechaRegistro)}</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-gray-100"></div>

              {/* Overall Rating */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {renderStars(promedioGeneral, 20)}
                  <span className="text-2xl font-bold text-gray-900 ml-1">{promedioGeneral.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500">{totalResenas} reseña{totalResenas !== 1 ? 's' : ''} total</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-3">
                {/* Report Button */}
                <button
                  onClick={reportUser}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <Flag size={16} />
                  Reportar usuario
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Package size={18} className="text-blue-600" />
                <p className="text-2xl font-bold text-gray-900">{serviciosActivos.length}</p>
              </div>
              <p className="text-xs text-gray-500 font-medium">Servicios</p>
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Servicios ofrecidos</h3>
                  <p className="text-sm text-gray-500 mt-1">Servicios publicados por este usuario</p>
                </div>
                {serviciosActivos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {serviciosActivos.map((servicio) => (
                      <ServiceCard 
                        key={servicio.id_Servicio} 
                        service={{ ...servicio, esOportunidad: false }}
                        onAction={requestService}
                        actionLabel="Solicitar servicio"
                        actionColor="blue"
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={Package} 
                    title="Sin servicios" 
                    description="Este usuario no tiene servicios publicados actualmente."
                    color="blue"
                  />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {oportunidadesActivas.map((oportunidad) => (
                      <ServiceCard 
                        key={oportunidad.id_Servicio} 
                        service={{ ...oportunidad, esOportunidad: true }}
                        onAction={postular}
                        actionLabel="Postularme"
                        actionColor="emerald"
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={TrendingUp} 
                    title="Sin oportunidades" 
                    description="Este usuario no tiene oportunidades publicadas actualmente."
                    color="emerald"
                  />
                )}
              </div>
            )}

            {/* Reseñas - With tabs for ofertante/cliente */}
            {activeTab === 'reseñas' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reseñas y calificaciones</h3>
                  <p className="text-sm text-gray-500 mt-1">Opiniones de otros usuarios sobre su trabajo</p>
                </div>
                <ReviewTabsComponent 
                  ofertanteReviews={resenasComoOfertante}
                  clienteReviews={resenasComoCliente}
                  promedioOfertante={promedioOfertante}
                  promedioCliente={promedioCliente}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}