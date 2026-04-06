import { useState, useEffect, useMemo, useCallback } from "react";
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
    Crown,
    CheckCircle,
    Clock,
    Edit2,
    Shield,
    CreditCard,
} from "lucide-react";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";
import { Button } from "../components/ui/Button";
import ProfileInfo from "./UserProfile/ProfileInfo";
import ProfileServices from "./UserProfile/ProfileServices";
import ProfileReviews from "./UserProfile/ProfileReviews";

// ============================================
// SKELETON COMPONENTS
// ============================================

function ProfileSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="mb-8 flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-9 w-40 bg-gray-200 animate-pulse rounded-lg" />
                    <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-10 w-36 bg-gray-200 animate-pulse rounded-xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Skeleton */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="h-32 bg-gray-200 animate-pulse" />
                        <div className="px-6 pb-6 -mt-14 relative">
                            <div className="w-28 h-28 rounded-2xl bg-gray-200 animate-pulse border-4 border-white shadow-lg mb-5" />
                            <div className="space-y-3">
                                <div className="h-6 w-44 bg-gray-200 animate-pulse rounded" />
                                <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
                                <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
                                <div className="grid grid-cols-2 gap-3 mt-5">
                                    <div className="h-20 bg-gray-200 animate-pulse rounded-xl" />
                                    <div className="h-20 bg-gray-200 animate-pulse rounded-xl" />
                                </div>
                                <div className="space-y-3 pt-5 border-t border-gray-100">
                                    <div className="h-8 bg-gray-200 animate-pulse rounded" />
                                    <div className="h-8 bg-gray-200 animate-pulse rounded" />
                                    <div className="h-8 bg-gray-200 animate-pulse rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 w-32 bg-gray-200 animate-pulse rounded-xl" />
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
                        <div className="space-y-4">
                            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                            <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="h-12 bg-gray-200 animate-pulse rounded-xl" />
                                <div className="h-12 bg-gray-200 animate-pulse rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// PLAN BADGE COMPONENT
// ============================================

function PlanBadge({ plan }) {
    if (!plan || plan === "Free") return null;

    const isPremium = plan === "Ultra";
    const isPlus = plan === "Plus";

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            isPremium
                ? "bg-linear-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-200"
                : isPlus
                    ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-200"
                    : "bg-gray-100 text-gray-700"
        }`}>
            <Crown size={12} />
            Plan {plan}
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

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
        plan: null,
        planExpiresAt: null,
    });

    const authHeaders = useCallback(() => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        Accept: "application/json",
    }), []);

    // Get current user from localStorage for plan info
    const storedUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "{}");
        } catch {
            return {};
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                // Merge plan info from stored user (has id_Plan from auth)
                const userPlan = storedUser?.id_Plan || user.id_Plan || null;

                setProfileData((prev) => ({
                    ...prev,
                    name: `${user.nombre || ""} ${user.apellido || ""}`.trim(),
                    email: user.id_CorreoUsuario || "",
                    phone: user.telefono || "",
                    location: `${user.ciudad || ""} ${user.departamento || ""}`.trim(),
                    title: user.rol || "Usuario",
                    memberSince: user.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString("es-CO", { year: "numeric", month: "long" }) : "",
                    plan: userPlan,
                    planExpiresAt: user.plan_vencimiento || null,
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

    const tabs = useMemo(() => [
        { id: "info", label: "Información", icon: User },
        { id: "services", label: "Servicios", icon: Package },
        { id: "reviews", label: "Reseñas", icon: Star },
    ], []);

    const renderStars = useMemo(() => {
        const rating = Math.round(Number(profileData.rating) || 0);
        return (
            <div className="flex items-center gap-0.5" role="img" aria-label={`Calificación: ${profileData.rating || '0'} de 5 estrellas`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={18}
                        className={star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                        aria-hidden="true"
                    />
                ))}
            </div>
        );
    }, [profileData.rating]);

    if (loading) {
        return <ProfileSkeleton />;
    }

    const totalReviews = (reviews.ofertante?.length || 0) + (reviews.cliente?.length || 0);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header — "Mi espacio" feel */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mi Perfil</h1>
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                            <Shield size={12} />
                            Tu espacio personal
                        </span>
                    </div>
                    <p className="text-gray-500 mt-1">Administra tu información personal y profesional</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => onNavigate && onNavigate('plans')}
                    >
                        <CreditCard size={16} />
                        Planes
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => onNavigate && onNavigate('config')}
                    >
                        <Settings size={16} />
                        Configuración
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-8 shadow-sm">
                        {/* Cover with "My Space" indicator */}
                        <div className="h-32 bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}></div>
                            {/* "Mi Perfil" badge on cover */}
                            <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                                    <CheckCircle size={12} />
                                    Verificado
                                </span>
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="px-6 pb-6">
                            <div className="relative -mt-14 mb-5">
                                {profileImage ? (
                                    <img
                                        src={resolveImageUrl(profileImage)}
                                        alt={profileData.name}
                                        className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-28 h-28 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg"
                                    style={{ display: profileImage ? 'none' : 'flex' }}
                                >
                                    {profileData.name.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* Name + Plan */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                                    <p className="text-emerald-600 font-medium mt-1">{profileData.title}</p>
                                </div>
                            </div>

                            {/* Plan Badge */}
                            <div className="mt-3">
                                <PlanBadge plan={profileData.plan} />
                                {!profileData.plan && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                        Plan Free
                                    </span>
                                )}
                            </div>

                            {/* Plan expiration */}
                            {profileData.plan && profileData.plan !== "Free" && profileData.planExpiresAt && (
                                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                                    <Clock size={12} />
                                    Vence: {new Date(profileData.planExpiresAt).toLocaleDateString("es-CO")}
                                </div>
                            )}

                            {/* Rating */}
                            <div className="flex items-center gap-2 mt-4">
                                {renderStars}
                                <span className="text-gray-700 font-semibold">{profileData.rating || "0.0"}</span>
                                <span className="text-gray-400 text-sm">({totalReviews})</span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center border border-emerald-100">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <Briefcase size={16} className="text-emerald-600" />
                                        <p className="text-2xl font-bold text-gray-900">{servicesOffered.length}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Servicios</p>
                                </div>
                                <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center border border-amber-100">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <Calendar size={16} className="text-amber-600" />
                                        <p className="text-2xl font-bold text-gray-900">{profileData.memberSince ? new Date(profileData.memberSince).getFullYear() || profileData.memberSince : "-"}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Desde</p>
                                </div>
                            </div>

                            {/* Contacto rápido (datos privados — solo visible en perfil propio) */}
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

                            {/* Plan benefits (if premium) */}
                            {profileData.plan && profileData.plan !== "Free" && (
                                <div className="mt-5 p-3 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award size={14} className="text-emerald-600" />
                                        <span className="text-xs font-semibold text-emerald-700">Beneficios del plan</span>
                                    </div>
                                    <ul className="text-xs text-emerald-600 space-y-1">
                                        <li className="flex items-center gap-1">
                                            <CheckCircle size={10} />
                                            Servicios ilimitados
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle size={10} />
                                            Soporte prioritario
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle size={10} />
                                            Badge verificado
                                        </li>
                                    </ul>
                                </div>
                            )}
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
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {tab.id === 'reviews' && totalReviews > 0 && (
                                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                                        activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                        {totalReviews}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Contenido del tab */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
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
