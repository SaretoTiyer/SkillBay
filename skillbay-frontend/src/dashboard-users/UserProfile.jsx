import { useState, useEffect, useMemo } from "react";
import {
    Camera,
    MapPin,
    Briefcase,
    Calendar,
    Mail,
    Phone,
    Edit2,
    Save,
    X,
    Star,
    CreditCard,
    Settings,
    Shield,
    Clock,
    User,
    Package,
    Award,
    TrendingUp,
    Globe,
    Smartphone,
    QrCode,
    Upload,
} from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function UserProfile({ onNavigate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [servicesOffered, setServicesOffered] = useState([]);
    const [servicesHired, setServicesHired] = useState([]);
    const [reviews, setReviews] = useState({ ofertante: [], cliente: [] });
    const [activeTab, setActiveTab] = useState("info");
    const [profileImage, setProfileImage] = useState(null);
    const [metodosPago, setMetodosPago] = useState({
        nequi_numero: "",
        nequi_nombre: "",
        nequi_qr: "",
        bancolombia_qr: "",
        metodos_pago_activos: ["tarjeta", "efectivo"],
    });
    const [savingMetodos, setSavingMetodos] = useState(false);

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

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const base = API_URL.replace('/api', '');
        return `${base}/storage/${path}`;
    };

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

            const [userRes, servicesRes, metodosRes] = await Promise.all([
                fetch(`${API_URL}/user`, { headers: authHeaders() }),
                fetch(`${API_URL}/servicios`, { headers: authHeaders() }),
                fetch(`${API_URL}/user/metodos-pago`, { headers: authHeaders() }),
            ]);

            const userData = await userRes.json();
            const servicesData = await servicesRes.json();
            const metodosData = await metodosRes.json();

            if (metodosData.success) {
                setMetodosPago({
                    nequi_numero: metodosData.data.nequi_numero || "",
                    nequi_nombre: metodosData.data.nequi_nombre || "",
                    nequi_qr: metodosData.data.nequi_qr || "",
                    bancolombia_qr: metodosData.data.bancolombia_qr || "",
                    metodos_pago_activos: metodosData.data.metodos_pago_activos || ["tarjeta", "efectivo"],
                });
            }

            let reviewsData = { resenas_como_ofertante: [], resenas_como_cliente: [] };
            let promedioData = { promedio: { general: 0 } };

            if (userData.usuario) {
                try {
                    const uid = userData.usuario.id_CorreoUsuario;
                    const [rRes, pRes] = await Promise.all([
                        fetch(`${API_URL}/resenas/usuario/${uid}`, { headers: authHeaders() }),
                        fetch(`${API_URL}/resenas/usuario/${uid}/promedio`, { headers: authHeaders() }),
                    ]);
                    reviewsData  = await rRes.json();
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
            setServicesHired([]);

            setReviews({
                ofertante: reviewsData?.resenas_como_ofertante || [],
                cliente: reviewsData?.resenas_como_cliente   || [],
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

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const nameParts = profileData.name.split(" ");
            const nombre = nameParts[0];
            const apellido = nameParts.slice(1).join(" ") || "";

            const locationParts = profileData.location.split(",");
            const ciudad = locationParts[0] ? locationParts[0].trim() : "";
            const departamento = locationParts[1] ? locationParts[1].trim() : "";

            const payload = {
                nombre,
                apellido: apellido || "Apellido",
                telefono: profileData.phone,
                ciudad,
                departamento,
            };

            const response = await fetch(`${API_URL}/user`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setIsEditing(false);
                Swal.fire({
                    icon: "success",
                    title: "Perfil actualizado",
                    text: "Tus datos han sido guardados correctamente.",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.message || "No se pudo actualizar el perfil.",
                });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error de conexión.",
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        fetchProfile();
    };

    const ReviewCard = ({ review }) => (
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString("es-CO", { day: 'numeric', month: 'short', year: 'numeric' }) : ""}
                </span>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Al ofertante:</span>
                    <div className="flex items-center gap-1" role="img" aria-label={`Calificación al ofertante: ${review.calificacion_usuario} de 5 estrellas`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={`user-${star}`}
                                size={14}
                                className={star <= (review.calificacion_usuario || 0) ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600">({review.calificacion_usuario || 0}/5)</span>
                </div>

                {review.calificacion_servicio !== null && review.calificacion_servicio !== undefined && (
                    <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Al servicio:</span>
                        <div className="flex items-center gap-1" role="img" aria-label={`Calificación al servicio: ${review.calificacion_servicio} de 5 estrellas`}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={`service-${star}`}
                                    size={14}
                                    className={star <= (review.calificacion_servicio || 0) ? "text-blue-400 fill-blue-400" : "text-gray-300"}
                                    aria-hidden="true"
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-600">({review.calificacion_servicio}/5)</span>
                    </div>
                )}
            </div>

            {review.comentario && (
                <p className="text-gray-600 text-sm leading-relaxed mt-3 pt-3 border-t border-gray-200">
                    {review.comentario}
                </p>
            )}
        </div>
    );

    const handleProfileImageClick = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('imagen_perfil', file);

            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`${API_URL}/user/imagen-perfil`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                const data = await response.json();
                if (response.ok) {
                    setProfileImage(data.imagen_perfil);
                    try {
                        const stored = JSON.parse(localStorage.getItem('usuario') || '{}');
                        stored.imagen_perfil = data.imagen_perfil;
                        localStorage.setItem('usuario', JSON.stringify(stored));
                        window.dispatchEvent(new Event('storage'));
                    } catch(e) {}
                    Swal.fire({
                        icon: 'success',
                        title: 'Foto actualizada',
                        text: 'Tu foto de perfil ha sido actualizada.',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'No se pudo subir la imagen.',
                    });
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de conexión.',
                });
            }
        };
        input.click();
    };

    const tabs = [
        { id: "info", label: "Información", icon: User },
        { id: "services", label: "Servicios", icon: Package },
        { id: "reviews", label: "Reseñas", icon: Star },
        { id: "payment", label: "Métodos de Pago", icon: CreditCard },
        { id: "settings", label: "Configuración", icon: Settings },
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mi Perfil</h1>
                <p className="text-gray-500 mt-1">Administra tu información personal y profesional</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Perfil lateral - Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-8">
                        {/* Cover */}
                        <div className="h-28 bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
                            {isEditing && (
                                <button className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                                    <Camera className="text-white" size={16} />
                                </button>
                            )}
                        </div>

                        {/* Avatar */}
                        <div className="px-6 pb-6">
                            <div className="relative -mt-14 mb-5">
                                {profileImage ? (
                                    <img
                                        src={getImageUrl(profileImage)}
                                        alt={profileData.name}
                                        className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-28 h-28 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600
                                               flex items-center justify-center text-white text-4xl font-bold
                                               border-4 border-white shadow-lg"
                                    style={{ display: profileImage ? 'none' : 'flex' }}
                                >
                                    {profileData.name.charAt(0).toUpperCase()}
                                </div>
                                <button 
                                    className="absolute bottom-1 right-1 bg-white p-2.5 rounded-xl shadow-md border border-gray-200 opacity-0 hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 group"
                                    onClick={handleProfileImageClick}
                                    aria-label="Cambiar foto de perfil"
                                    title="Cambiar foto de perfil"
                                >
                                    <Camera size={14} className="text-blue-600" />
                                </button>
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

                            {/* Stats - Tarjetas de estadísticas */}
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

                            {/* Botón editar */}
                            <div className="mt-6">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                                    >
                                        <Edit2 size={16} />
                                        Editar Perfil
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handleCancel} className="flex-1 py-3">
                                            <X size={16} />
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 py-3">
                                            <Save size={16} />
                                            Guardar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    {/* Tabs - Navegación */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Información Personal</h3>
                                    <p className="text-sm text-gray-500">Actualiza tu información de perfil</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                                        {isEditing ? (
                                            <Input
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="py-3"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                                                {profileData.name || "No definido"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" />
                                            {profileData.email}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                        {isEditing ? (
                                            <Input
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                placeholder="Número de teléfono"
                                                className="py-3"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center gap-2">
                                                <Phone size={16} className="text-gray-400" />
                                                {profileData.phone || "No definido"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                                        {isEditing ? (
                                            <Input
                                                value={profileData.location}
                                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                                placeholder="Ciudad, Departamento"
                                                className="py-3"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400" />
                                                {profileData.location || "No definido"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Rol</label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center gap-2">
                                            <Award size={16} className="text-gray-400" />
                                            {profileData.title}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Miembro desde</label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            {profileData.memberSince || "No disponible"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "services" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Servicios Ofrecidos</h3>
                                        <p className="text-sm text-gray-500">Gestiona tus servicios publicados</p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        {servicesOffered.length} servicio{servicesOffered.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                {servicesOffered.length > 0 ? (
                                    <div className="grid gap-4">
                                        {servicesOffered.map((service) => (
                                            <div key={service.id_Servicio} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-100/50 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-linear-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                                        <Briefcase className="text-blue-600" size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{service.titulo}</p>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                            {service.categoria?.nombre || "Sin categoría"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-blue-600 text-lg">
                                                        ${Number(service.precio || 0).toLocaleString("es-CO")}
                                                    </p>
                                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                                        service.estado === 'Activo' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            service.estado === 'Activo' ? 'bg-green-500' : 'bg-gray-400'
                                                        }`}></span>
                                                        {service.estado || "Activo"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 px-8">
                                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Package size={36} className="text-gray-300" />
                                        </div>
                                        <h4 className="text-gray-900 font-semibold mb-2">No has creado servicios todavía</h4>
                                        <p className="text-gray-500 mb-6">Crea tu primer servicio para comenzar a recibir clientes</p>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Briefcase size={16} />
                                            Crear Servicio
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Reseñas</h3>
                                    <p className="text-sm text-gray-500">Opiniones de otros usuarios sobre tu trabajo</p>
                                </div>
                                
                                {/* Como ofertante */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                        <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                            <TrendingUp size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Como Ofertante</h4>
                                            <p className="text-sm text-gray-500">{reviews.ofertante?.length || 0} reseñas</p>
                                        </div>
                                    </div>
                                    {reviews.ofertante?.length > 0 ? (
                                        <div className="space-y-3">
                                            {reviews.ofertante.map((review, idx) => (
                                                <ReviewCard key={idx} review={review} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-gray-400">Sin reseñas como ofertante aún</p>
                                        </div>
                                    )}
                                </div>

                                {/* Como cliente */}
                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                        <div className="w-10 h-10 bg-linear-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                                            <Globe size={18} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Como Cliente</h4>
                                            <p className="text-sm text-gray-500">{reviews.cliente?.length || 0} reseñas</p>
                                        </div>
                                    </div>
                                    {reviews.cliente?.length > 0 ? (
                                        <div className="space-y-3">
                                            {reviews.cliente.map((review, idx) => (
                                                <ReviewCard key={idx} review={review} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-gray-400">Sin reseñas como cliente aún</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Configuración de Cuenta</h3>
                                    <p className="text-sm text-gray-500">Administra la configuración de tu cuenta</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Shield className="text-blue-600" size={22} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Seguridad</p>
                                                <p className="text-sm text-gray-500">Gestiona tu contraseña</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="px-4"
                                            onClick={async () => {
                                                const { value: passwordValues } = await Swal.fire({
                                                    title: 'Cambiar contraseña',
                                                    html:
                                                    '<input id="password1" type="password" class="swal2-input" placeholder="Nueva contraseña">' +
                                                    '<input id="password2" type="password" class="swal2-input" placeholder="Confirmar contraseña">',
                                                    confirmButtonText: 'Cambiar',
                                                    showCancelButton: true,
                                                    preConfirm: () => {
                                                        const password1 = document.getElementById('password1').value
                                                        const password2 = document.getElementById('password2').value
                                                        if (!password1 || !password2) {
                                                            Swal.showValidationError('Por favor ingrese ambas contraseñas')
                                                            return false
                                                        }
                                                        if (password1 !== password2) {
                                                            Swal.showValidationError('Las contraseñas no coinciden')
                                                            return false
                                                        }
                                                        if (password1.length < 8) {
                                                            Swal.showValidationError('La contraseña debe tener al menos 8 caracteres')
                                                            return false
                                                        }
                                                        return [password1, password2]
                                                    }
                                                })
                                            
                                                if (passwordValues) {
                                                    try {
                                                        const token = localStorage.getItem("access_token");
                                                        const response = await fetch(`${API_URL}/user`, {
                                                            method: "PUT",
                                                            headers: {
                                                                Authorization: `Bearer ${token}`,
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({ password: passwordValues[0] }),
                                                        });
                                                        
                                                        if (response.ok) {
                                                            Swal.fire({
                                                                icon: 'success',
                                                                title: 'Contraseña cambiada',
                                                                text: 'Tu contraseña ha sido actualizada correctamente.',
                                                                timer: 1500,
                                                                showConfirmButton: false,
                                                            });
                                                        } else {
                                                            const errorData = await response.json();
                                                            Swal.fire({
                                                                icon: 'error',
                                                                title: 'Error',
                                                                text: errorData.message || 'No se pudo cambiar la contraseña.',
                                                            });
                                                        }
                                                    } catch (error) {
                                                        Swal.fire('Error', error.message, 'error');
                                                    }
                                                }
                                            }}
                                        >
                                            Cambiar
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <CreditCard className="text-green-600" size={22} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Métodos de pago</p>
                                                <p className="text-sm text-gray-500">Administra tus métodos de pago</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="px-4"
                                            onClick={() => onNavigate && onNavigate('payments')}
                                        >
                                            Ver
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <Clock className="text-purple-600" size={22} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Notificaciones</p>
                                                <p className="text-sm text-gray-500">Configura tus preferencias</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="px-4"
                                            onClick={() => onNavigate && onNavigate('notifications')}
                                        >
                                            Configurar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "payment" && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Métodos de Pago</h3>
                                    <p className="text-sm text-gray-500">Configura cómo recibirás los pagos de tus servicios</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Shield className="text-blue-600" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-blue-900">Información importante</p>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Configura tus métodos de pago para que los clientes puedan pagarte por tus servicios. 
                                                    Tus datos de pago solo serán visibles cuando un cliente complete una contratación.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-xl p-6 space-y-6">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Smartphone size={18} className="text-purple-600" />
                                            Nequi
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Número de Nequi
                                                </label>
                                                <Input
                                                    type="tel"
                                                    value={metodosPago.nequi_numero}
                                                    onChange={(e) => setMetodosPago({ ...metodosPago, nequi_numero: e.target.value })}
                                                    placeholder="3123456789"
                                                    maxLength={20}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nombre del titular
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={metodosPago.nequi_nombre}
                                                    onChange={(e) => setMetodosPago({ ...metodosPago, nequi_nombre: e.target.value })}
                                                    placeholder="Nombre como aparece en Nequi"
                                                    maxLength={100}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                QR de Nequi <span className="text-gray-400 font-normal">(opcional)</span>
                                            </label>
                                            {metodosPago.nequi_qr ? (
                                                <div className="relative inline-block">
                                                    <img 
                                                        src={metodosPago.nequi_qr.startsWith('http') ? metodosPago.nequi_qr : `${API_URL.replace('/api', '')}/storage/${metodosPago.nequi_qr}`}
                                                        alt="QR Nequi"
                                                        className="w-32 h-32 object-contain border border-gray-200 rounded-lg"
                                                    />
                                                    <button
                                                        onClick={() => setMetodosPago({ ...metodosPago, nequi_qr: '' })}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            
                                                            const formData = new FormData();
                                                            formData.append('tipo', 'nequi_qr');
                                                            formData.append('imagen', file);
                                                            
                                                            try {
                                                                const token = localStorage.getItem("access_token");
                                                                const response = await fetch(`${API_URL}/user/metodos-pago/qr`, {
                                                                    method: 'POST',
                                                                    headers: { Authorization: `Bearer ${token}` },
                                                                    body: formData,
                                                                });
                                                                const data = await response.json();
                                                                if (data.success) {
                                                                    setMetodosPago({ ...metodosPago, nequi_qr: data.data.nequi_qr });
                                                                    Swal.fire('Éxito', 'QR de Nequi actualizado', 'success');
                                                                }
                                                            } catch (error) {
                                                                Swal.fire('Error', 'No se pudo subir el QR', 'error');
                                                            }
                                                        }}
                                                    />
                                                    <div className="text-center">
                                                        <Upload className="mx-auto text-gray-400" size={24} />
                                                        <span className="text-xs text-gray-500 block mt-1">Subir QR</span>
                                                    </div>
                                                </label>
                                            )}
                                        </div>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={metodosPago.metodos_pago_activos?.includes('nequi')}
                                                onChange={(e) => {
                                                    const nuevosActivos = e.target.checked
                                                        ? [...(metodosPago.metodos_pago_activos || []), 'nequi']
                                                        : (metodosPago.metodos_pago_activos || []).filter(m => m !== 'nequi');
                                                    setMetodosPago({ ...metodosPago, metodos_pago_activos: nuevosActivos });
                                                }}
                                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Activar Nequi como método de pago</span>
                                        </label>
                                    </div>

                                    <div className="border border-gray-200 rounded-xl p-6 space-y-6">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <QrCode size={18} className="text-yellow-600" />
                                            QR Bancolombia
                                        </h4>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Imagen QR de Bancolombia
                                            </label>
                                            {metodosPago.bancolombia_qr ? (
                                                <div className="relative inline-block">
                                                    <img 
                                                        src={metodosPago.bancolombia_qr.startsWith('http') ? metodosPago.bancolombia_qr : `${API_URL.replace('/api', '')}/storage/${metodosPago.bancolombia_qr}`}
                                                        alt="QR Bancolombia"
                                                        className="w-32 h-32 object-contain border border-gray-200 rounded-lg"
                                                    />
                                                    <button
                                                        onClick={() => setMetodosPago({ ...metodosPago, bancolombia_qr: '' })}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            
                                                            const formData = new FormData();
                                                            formData.append('tipo', 'bancolombia_qr');
                                                            formData.append('imagen', file);
                                                            
                                                            try {
                                                                const token = localStorage.getItem("access_token");
                                                                const response = await fetch(`${API_URL}/user/metodos-pago/qr`, {
                                                                    method: 'POST',
                                                                    headers: { Authorization: `Bearer ${token}` },
                                                                    body: formData,
                                                                });
                                                                const data = await response.json();
                                                                if (data.success) {
                                                                    setMetodosPago({ ...metodosPago, bancolombia_qr: data.data.bancolombia_qr });
                                                                    Swal.fire('Éxito', 'QR de Bancolombia actualizado', 'success');
                                                                }
                                                            } catch (error) {
                                                                Swal.fire('Error', 'No se pudo subir el QR', 'error');
                                                            }
                                                        }}
                                                    />
                                                    <div className="text-center">
                                                        <Upload className="mx-auto text-gray-400" size={24} />
                                                        <span className="text-xs text-gray-500 block mt-1">Subir QR</span>
                                                    </div>
                                                </label>
                                            )}
                                        </div>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={metodosPago.metodos_pago_activos?.includes('bancolombia_qr')}
                                                onChange={(e) => {
                                                    const nuevosActivos = e.target.checked
                                                        ? [...(metodosPago.metodos_pago_activos || []), 'bancolombia_qr']
                                                        : (metodosPago.metodos_pago_activos || []).filter(m => m !== 'bancolombia_qr');
                                                    setMetodosPago({ ...metodosPago, metodos_pago_activos: nuevosActivos });
                                                }}
                                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Activar QR Bancolombia como método de pago</span>
                                        </label>
                                    </div>

                                    <div className="border border-gray-200 rounded-xl p-6 space-y-4">
                                        <h4 className="font-semibold text-gray-900">Otros métodos</h4>
                                        
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={metodosPago.metodos_pago_activos?.includes('tarjeta')}
                                                onChange={(e) => {
                                                    const nuevosActivos = e.target.checked
                                                        ? [...(metodosPago.metodos_pago_activos || []), 'tarjeta']
                                                        : (metodosPago.metodos_pago_activos || []).filter(m => m !== 'tarjeta');
                                                    setMetodosPago({ ...metodosPago, metodos_pago_activos: nuevosActivos });
                                                }}
                                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <CreditCard size={18} className="text-gray-500" />
                                            <span className="text-sm text-gray-700">Tarjeta de Crédito/Débito</span>
                                        </label>
                                        
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={metodosPago.metodos_pago_activos?.includes('efectivo')}
                                                onChange={(e) => {
                                                    const nuevosActivos = e.target.checked
                                                        ? [...(metodosPago.metodos_pago_activos || []), 'efectivo']
                                                        : (metodosPago.metodos_pago_activos || []).filter(m => m !== 'efectivo');
                                                    setMetodosPago({ ...metodosPago, metodos_pago_activos: nuevosActivos });
                                                }}
                                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <Globe size={18} className="text-gray-500" />
                                            <span className="text-sm text-gray-700">Pago en efectivo</span>
                                        </label>
                                    </div>

                                    <Button
                                        onClick={async () => {
                                            setSavingMetodos(true);
                                            try {
                                                const token = localStorage.getItem("access_token");
                                                const response = await fetch(`${API_URL}/user/metodos-pago`, {
                                                    method: 'PUT',
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        nequi_numero: metodosPago.nequi_numero,
                                                        nequi_nombre: metodosPago.nequi_nombre,
                                                        metodos_pago_activos: metodosPago.metodos_pago_activos,
                                                    }),
                                                });
                                                const data = await response.json();
                                                if (data.success) {
                                                    Swal.fire({
                                                        icon: 'success',
                                                        title: 'Guardado',
                                                        text: 'Métodos de pago actualizados correctamente',
                                                        timer: 1500,
                                                        showConfirmButton: false,
                                                    });
                                                } else {
                                                    Swal.fire('Error', data.message || 'No se pudieron guardar los métodos de pago', 'error');
                                                }
                                            } catch (error) {
                                                Swal.fire('Error', 'Error de conexión', 'error');
                                            } finally {
                                                setSavingMetodos(false);
                                            }
                                        }}
                                        disabled={savingMetodos}
                                        className="w-full"
                                    >
                                        {savingMetodos ? 'Guardando...' : 'Guardar cambios'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
