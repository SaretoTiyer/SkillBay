import { useState, useEffect, useMemo } from "react";
import {
    Camera,
    MapPin,
    Briefcase,
    Calendar,
    Mail,
    Phone,
    Star,
    User,
    Package,
    Award,
    Settings,
    TrendingUp,
} from "lucide-react";
import { API_URL } from "../config/api";
import { Button } from "../components/ui/Button";
import ProfileInfo from "./UserProfile/ProfileInfo";
import ProfileServices from "./UserProfile/ProfileServices";
import ProfileReviews from "./UserProfile/ProfileReviews";

export default function UserProfile({ onNavigate }) {
    const [loading, setLoading] = useState(true);
    const [servicesOffered, setServicesOffered] = useState([]);
    const [reviews, setReviews] = useState({ ofertante: [], cliente: [] });
    const [activeTab, setActiveTab] = useState("info");
    const [profileImage, setProfileImage] = useState(null);
    const [profileData, setProfileData] = useState({
        name: "",
        title: "",
        location: "",
        email: "",
        phone: "",
        bio: "",
        projectsCompleted: 0,
        rating: 0,
        memberSince: "",
    });

    const authHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        Accept: "application/json",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            const [userRes, servicesRes] = await Promise.all([
                fetch(`${API_URL}/user`, { headers: authHeaders() }),
                fetch(`${API_URL}/servicios`, { headers: authHeaders() }),
            ]);

            const userData = await userRes.json();
            const servicesData = await servicesRes.json();

            let reviewsData = { resenas_como_ofertante: [], resenas_como_cliente: [] };
            let promedioData = { promedio: { general: 0 } };

            if (userData.usuario) {
                try {
                    const uid = userData.usuario.id_CorreoUsuario;
                    const [rRes, pRes] = await Promise.all([
                        fetch(`${API_URL}/resenas/usuario/${uid}`, { headers: authHeaders() }),
                        fetch(`${API_URL}/resenas/usuario/${uid}/promedio`, { headers: authHeaders() }),
                    ]);
                    reviewsData = await rRes.json();
                    promedioData = await pRes.json();
                } catch (e) {
                    console.error('Error fetching reviews:', e);
                }
            }

            if (userData.usuario) {
                const user = userData.usuario;
                setProfileData((prev) => ({
                    ...prev,
                    name: `${user.nombre || ""} ${user.apellido || ""}`.trim(),
                    email: user.id_CorreoUsuario || "",
                    phone: user.telefono || "",
                    location: `${user.ciudad || ""} ${user.departamento || ""}`.trim(),
                    title: user.rol || "Usuario",
                    memberSince: user.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString("es-CO", { year: "numeric", month: "long" }) : "",
                }));
                if (user.imagen_perfil) {
                    setProfileImage(user.imagen_perfil);
                }
            }

            const servicesArray = Array.isArray(servicesData)
                ? servicesData.filter(s => s.tipo === 'servicio' || !s.tipo)
                : (Array.isArray(servicesData?.servicios)
                    ? servicesData.servicios.filter(s => s.tipo === 'servicio' || !s.tipo)
                    : []);
            setServicesOffered(servicesArray);

            setReviews({
                ofertante: reviewsData?.resenas_como_ofertante || [],
                cliente: reviewsData?.resenas_como_cliente || [],
            });

            const promedio = promedioData?.promedio?.general || 0;
            setProfileData(prev => ({
                ...prev,
                rating: Number(promedio).toFixed(1),
                projectsCompleted: servicesArray.length,
            }));
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "info", label: "Información", icon: User },
        { id: "services", label: "Servicios", icon: Package },
        { id: "reviews", label: "Reseñas", icon: Star },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mi Perfil</h1>
                    <p className="text-gray-500 mt-1">Administra tu información personal y profesional</p>
                </div>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => onNavigate && onNavigate('config')}
                >
                    <Settings size={16} />
                    Configuración
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-8">
                        {/* Cover */}
                        <div className="h-28 bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}></div>
                        </div>

                        {/* Avatar */}
                        <div className="px-6 pb-6">
                            <div className="relative -mt-14 mb-5">
                                {profileImage ? (
                                    <img
                                        src={`${API_URL.replace('/api', '')}/storage/${profileImage}`}
                                        alt={profileData.name}
                                        className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-28 h-28 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg"
                                    style={{ display: profileImage ? 'none' : 'flex' }}
                                >
                                    {profileData.name.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* Info básica */}
                            <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                            <p className="text-blue-600 font-medium mt-1">{profileData.title}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mt-4">
                                <div className="flex items-center gap-0.5" role="img" aria-label={`Calificación: ${profileData.rating || '0'} de 5 estrellas`}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={18}
                                            className={star <= Math.round(profileData.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-700 font-semibold">{profileData.rating || "0.0"}</span>
                                <span className="text-gray-400 text-sm">({(reviews.ofertante?.length || 0) + (reviews.cliente?.length || 0)})</span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <Briefcase size={16} className="text-blue-600" />
                                        <p className="text-2xl font-bold text-gray-900">{servicesOffered.length}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Servicios</p>
                                </div>
                                <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center border border-amber-100">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <Calendar size={16} className="text-amber-600" />
                                        <p className="text-2xl font-bold text-gray-900">{profileData.memberSince ? new Date(profileData.memberSince).getFullYear() || profileData.memberSince : "-"}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Año</p>
                                </div>
                            </div>

                            {/* Contacto rápido */}
                            <div className="mt-5 space-y-3 pt-5 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Mail size={14} className="text-gray-500" />
                                    </div>
                                    <span className="truncate font-medium">{profileData.email}</span>
                                </div>
                                {profileData.phone && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <Phone size={14} className="text-gray-500" />
                                        </div>
                                        <span>{profileData.phone}</span>
                                    </div>
                                )}
                                {profileData.location && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <MapPin size={14} className="text-gray-500" />
                                        </div>
                                        <span>{profileData.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {tab.id === 'reviews' && ((reviews.ofertante?.length || 0) + (reviews.cliente?.length || 0)) > 0 && (
                                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                                        activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                        {(reviews.ofertante?.length || 0) + (reviews.cliente?.length || 0)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Contenido del tab */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
                        {activeTab === "info" && (
                            <ProfileInfo
                                profileData={profileData}
                                profileImage={profileImage}
                                servicesOffered={servicesOffered}
                                onUpdate={fetchProfile}
                            />
                        )}

                        {activeTab === "services" && (
                            <ProfileServices
                                servicesOffered={servicesOffered}
                                onNavigate={onNavigate}
                            />
                        )}

                        {activeTab === "reviews" && (
                            <ProfileReviews reviews={reviews} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
