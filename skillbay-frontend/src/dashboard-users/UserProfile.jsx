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
    CheckCircle,
    User,
    Package,
} from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/badge";

export default function UserProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [servicesOffered, setServicesOffered] = useState([]);
    const [servicesHired, setServicesHired] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState("info");

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

            const [userRes, servicesRes, reviewsRes] = await Promise.all([
                fetch(`${API_URL}/user`, { headers: authHeaders() }),
                fetch(`${API_URL}/servicios`, { headers: authHeaders() }),
                fetch(`${API_URL}/resenas`, { headers: authHeaders() }).catch(() => ({ ok: true, json: () => ({ resenas: [] }) })),
            ]);

            const userData = await userRes.json();
            const servicesData = await servicesRes.json();
            const reviewsData = await reviewsRes.json();

            if (userData.usuario) {
                const user = userData.usuario;
                setProfileData((prev) => ({
                    ...prev,
                    name: `${user.nombre || ""} ${user.apellido || ""}`.trim(),
                    email: user.id_CorreoUsuario || "",
                    phone: user.telefono || "",
                    location: `${user.ciudad || ""} ${user.departamento || ""}`.trim(),
                    title: user.rol || "Usuario",
                    memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long" }) : "",
                }));
            }

            const services = Array.isArray(servicesData) ? servicesData : [];
            setServicesOffered(services);
            setServicesHired([]); // Could fetch from postulaciones

            const resenas = Array.isArray(reviewsData?.resenas) ? reviewsData.resenas : [];
            setReviews(resenas);

            // Calculate rating
            if (resenas.length > 0) {
                const avgRating = resenas.reduce((acc, r) => acc + (r.calificacion || 0), 0) / resenas.length;
                setProfileData(prev => ({ ...prev, rating: avgRating.toFixed(1), projectsCompleted: services.length }));
            }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Mi Perfil</h1>
                <p className="text-slate-500 mt-1">Administra tu información personal y profesional</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Perfil lateral */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-4">
                        {/* Cover */}
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-700 relative">
                            {isEditing && (
                                <button className="absolute top-3 right-3 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                                    <Camera className="text-white" size={16} />
                                </button>
                            )}
                        </div>

                        {/* Avatar */}
                        <div className="px-6 pb-6">
                            <div className="relative -mt-12 mb-4">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md">
                                    {profileData.name.charAt(0).toUpperCase()}
                                </div>
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-slate-200">
                                        <Camera size={14} className="text-blue-600" />
                                    </button>
                                )}
                            </div>

                            {/* Info básica */}
                            <h2 className="text-xl font-bold text-slate-800">{profileData.name}</h2>
                            <p className="text-blue-600 font-medium">{profileData.title}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={16}
                                            className={star <= Math.round(profileData.rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}
                                        />
                                    ))}
                                </div>
                                <span className="text-slate-600 font-medium">{profileData.rating || "0.0"}</span>
                                <span className="text-slate-400 text-sm">({reviews.length} reseñas)</span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <p className="text-xl font-bold text-slate-800">{servicesOffered.length}</p>
                                    <p className="text-xs text-slate-500">Servicios</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <p className="text-xl font-bold text-slate-800">{profileData.memberSince ? new Date(profileData.memberSince).getFullYear() : "-"}</p>
                                    <p className="text-xs text-slate-500">Miembro desde</p>
                                </div>
                            </div>

                            {/* Contacto rápido */}
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={14} className="text-slate-400" />
                                    <span className="truncate">{profileData.email}</span>
                                </div>
                                {profileData.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone size={14} className="text-slate-400" />
                                        <span>{profileData.phone}</span>
                                    </div>
                                )}
                                {profileData.location && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin size={14} className="text-slate-400" />
                                        <span>{profileData.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Botón editar */}
                            <div className="mt-6">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Edit2 size={16} className="mr-2" />
                                        Editar Perfil
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handleCancel} className="flex-1">
                                            <X size={16} className="mr-1" />
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
                                            <Save size={16} className="mr-1" />
                                            Guardar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                                activeTab === "info"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            <User size={18} />
                            Información
                        </button>
                        <button
                            onClick={() => setActiveTab("services")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                                activeTab === "services"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            <Package size={18} />
                            Mis Servicios
                        </button>
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                                activeTab === "reviews"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            <Star size={18} />
                            Reseñas
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                                activeTab === "settings"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            <Settings size={18} />
                            Configuración
                        </button>
                    </div>

                    {/* Contenido del tab */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        {activeTab === "info" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-800">Información Personal</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Nombre completo</label>
                                        {isEditing ? (
                                            <Input
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            />
                                        ) : (
                                            <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{profileData.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Correo electrónico</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{profileData.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                                        {isEditing ? (
                                            <Input
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                placeholder="Número de teléfono"
                                            />
                                        ) : (
                                            <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{profileData.phone || "No definido"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Ubicación</label>
                                        {isEditing ? (
                                            <Input
                                                value={profileData.location}
                                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                                placeholder="Ciudad, Departamento"
                                            />
                                        ) : (
                                            <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{profileData.location || "No definido"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Rol</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{profileData.title}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Miembro desde</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{profileData.memberSince || "No disponible"}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "services" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800">Servicios Ofrecidos</h3>
                                {servicesOffered.length > 0 ? (
                                    <div className="grid gap-4">
                                        {servicesOffered.map((service) => (
                                            <div key={service.id_Servicio} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Briefcase className="text-blue-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{service.titulo}</p>
                                                        <p className="text-sm text-slate-500">{service.categoria?.nombre || "Sin categoría"}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-blue-600">
                                                        ${Number(service.precio || 0).toLocaleString("es-CO")} COP
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        service.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {service.estado || "Activo"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <Service size={40} className="mx-auto mb-2 text-slate-300" />
                                        <p>No has creado servicios todavía</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800">Reseñas Recibidas</h3>
                                {reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={14}
                                                                className={star <= review.calificacion ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-slate-400">
                                                        {review.fechaReseña ? new Date(review.fechaReseña).toLocaleDateString("es-CO") : ""}
                                                    </span>
                                                </div>
                                                {review.comentario && (
                                                    <p className="text-slate-600 text-sm">{review.comentario}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <Star size={40} className="mx-auto mb-2 text-slate-300" />
                                        <p>No tienes reseñas todavía</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-800">Configuración de Cuenta</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Shield className="text-slate-500" size={20} />
                                            <div>
                                                <p className="font-medium text-slate-800">Seguridad</p>
                                                <p className="text-sm text-slate-500">Gestiona tu contraseña</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Cambiar</Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="text-slate-500" size={20} />
                                            <div>
                                                <p className="font-medium text-slate-800">Métodos de pago</p>
                                                <p className="text-sm text-slate-500">Administra tus métodos de pago</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Ver</Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Clock className="text-slate-500" size={20} />
                                            <div>
                                                <p className="font-medium text-slate-800">Notificaciones</p>
                                                <p className="text-sm text-slate-500">Configura tus preferencias</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Configurar</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
