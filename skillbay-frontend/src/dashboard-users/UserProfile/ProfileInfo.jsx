import { useState, useCallback } from "react";
import { Camera, Save, X, Mail, Phone, MapPin, Calendar, Award, Edit2 } from "lucide-react";
import { showSuccess, showError } from "../../utils/swalHelpers";
import { API_URL } from "../../config/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function ProfileInfo({ profileData, profileImage, servicesOffered, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState(profileData);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const base = API_URL.replace('/api', '');
        return `${base}/storage/${path}`;
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const nameParts = localData.name.split(" ");
            const nombre = nameParts[0];
            const apellido = nameParts.slice(1).join(" ") || "";
            const locationParts = localData.location.split(",");
            const ciudad = locationParts[0] ? locationParts[0].trim() : "";
            const departamento = locationParts[1] ? locationParts[1].trim() : "";

            const payload = {
                nombre,
                apellido: apellido || "Apellido",
                telefono: localData.phone,
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
                onUpdate();
                showSuccess("Perfil actualizado", "Tus datos han sido guardados correctamente.");
            } else {
                showError("Error", data.message || "No se pudo actualizar el perfil.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            showError("Error", "Error de conexión.");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setLocalData(profileData);
    };

    const handleProfileImageClick = useCallback(async () => {
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
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                const data = await response.json();
                if (response.ok) {
                    // Update localStorage with new profile image
                    const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
                    if (data.usuario?.imagen_perfil) {
                        storedUser.imagen_perfil = data.usuario.imagen_perfil;
                    } else if (data.path) {
                        storedUser.imagen_perfil = data.path;
                    }
                    localStorage.setItem('usuario', JSON.stringify(storedUser));
                    // Dispatch storage event so DashboardLayout updates immediately
                    window.dispatchEvent(new Event('storage'));
                    onUpdate();
                    showSuccess('Foto actualizada', 'Tu foto de perfil ha sido actualizada.');
                } else {
                    showError('Error', data.message || 'No se pudo subir la imagen.');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                showError('Error', 'Error de conexión.');
            }
        };
        input.click();
    }, [onUpdate]);

    return (
        <div className="space-y-8">
            {/* Edit Button - Only visible in Info tab */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Información Personal</h3>
                    <p className="text-sm text-gray-500">Actualiza tu información de perfil</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Edit2 size={16} />
                        Editar Perfil
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            <X size={16} />
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                            <Save size={16} />
                            Guardar
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl overflow-hidden">
                <div className="h-24 relative">
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>
                <div className="px-6 pb-6 -mt-12 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="relative">
                            {profileImage ? (
                                <img
                                    src={getImageUrl(profileImage)}
                                    alt={profileData.name}
                                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <div
                                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg"
                                style={{ display: profileImage ? 'none' : 'flex' }}
                            >
                                {profileData.name.charAt(0).toUpperCase()}
                            </div>
                            <button
                                className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl hover:scale-110 active:scale-95 transition-all"
                                onClick={handleProfileImageClick}
                                aria-label="Cambiar foto de perfil"
                                title="Cambiar foto de perfil"
                            >
                                <Camera size={16} className="text-blue-600" />
                            </button>
                        </div>
                        <div className="flex-1 pb-1">
                            <h2 className="text-xl font-bold text-white">{profileData.name}</h2>
                            <p className="text-blue-100 text-sm mt-1">{profileData.title}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                                <p className="text-white font-bold">{servicesOffered.length}</p>
                                <p className="text-blue-100 text-xs">Servicios</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                                <p className="text-white font-bold">{profileData.memberSince ? new Date(profileData.memberSince).getFullYear() || profileData.memberSince : "-"}</p>
                                <p className="text-blue-100 text-xs">Año</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                    {isEditing ? (
                        <Input value={localData.name} onChange={(e) => setLocalData({ ...localData, name: e.target.value })} className="py-3" />
                    ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">{profileData.name || "No definido"}</div>
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
                        <Input value={localData.phone} onChange={(e) => setLocalData({ ...localData, phone: e.target.value })} placeholder="Número de teléfono" className="py-3" />
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
                        <Input value={localData.location} onChange={(e) => setLocalData({ ...localData, location: e.target.value })} placeholder="Ciudad, Departamento" className="py-3" />
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
    );
}
