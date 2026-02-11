import { useState, useEffect } from "react";
import {
    Camera,
    MapPin,
    Briefcase,
    Calendar,
    Mail,
    Phone,
    Globe,
    Edit2,
    Save,
    X,
} from "lucide-react";
import Swal from 'sweetalert2';
import { API_URL } from "../config/api"; // Asegúrate de tener esto configurado

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Badge } from "../components/ui/badge";

export default function UserProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState({
        name: "",
        title: "", // No está en BD, se puede dejar vacío o usar un campo extra si existiera
        location: "",
        email: "",
        phone: "",
        website: "", // No está en BD
        bio: "", // No está en BD
        skills: [], // No está en BD
        experience: "", // No está en BD
        projectsCompleted: 0,
        rating: 0,
        languages: [],
    });

    // Cargar datos del usuario al montar
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            const response = await fetch(`${API_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.usuario;

                // Mapear datos del backend al estado del frontend
                setProfileData((prev) => ({
                    ...prev,
                    name: `${user.nombre} ${user.apellido}`, // Concatenamos para mostrar, pero al editar se debe manejar con cuidado
                    // Para edición, mejor separar nombre y apellido en el formulario, 
                    // pero por simplicidad con la UI actual mantendremos la estructura y ajustaremos el guardado.
                    email: user.id_CorreoUsuario,
                    phone: user.telefono || "",
                    location: `${user.ciudad || ""} ${user.departamento || ""}`.trim(),
                    // Los siguientes campos no están en la BD actual, los dejamos como placeholder o vacíos
                    title: user.rol || "Usuario",
                }));
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

            // Separar nombre y apellido de 'name' si se editó todo junto
            // Esta es una solución rápida, idealmente inputs separados
            const nameParts = profileData.name.split(" ");
            const nombre = nameParts[0];
            const apellido = nameParts.slice(1).join(" ") || "";

            // Separar ciudad y departamento (muy simplificado)
            const locationParts = profileData.location.split(",");
            const ciudad = locationParts[0] ? locationParts[0].trim() : "";
            const departamento = locationParts[1] ? locationParts[1].trim() : "";

            const payload = {
                nombre,
                apellido: apellido || "Apellido", // Fallback para validación
                telefono: profileData.phone,
                ciudad,
                departamento,
                genero: "Otro" // Default
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
                    icon: 'success',
                    title: 'Perfil actualizado',
                    text: 'Tus datos han sido guardados correctamente.',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Actualizar usuario en localStorage también si es necesario
                // localStorage.setItem("usuario", JSON.stringify(data.usuario));
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'No se pudo actualizar el perfil.',
                });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error de conexión.',
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        fetchProfile(); // Revertir cambios recargando datos
    };

    if (loading) return <div className="p-8 text-center">Cargando perfil...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-[#1E3A5F]">Mi Perfil</h1>
                    <p className="text-[#A0AEC0] mt-1">
                        Administra tu información personal y profesional
                    </p>
                </div>

                {!isEditing ? (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-linear-to-r from-[#2B6CB0] to-[#1E3A5F] text-white"
                    >
                        <Edit2 size={18} className="mr-2" />
                        Editar Perfil
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            <X size={18} className="mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-linear-to-r from-green-500 to-green-600 text-white"
                        >
                            <Save size={18} className="mr-2" />
                            Guardar
                        </Button>
                    </div>
                )}
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg border mb-6">
                {/* Cover */}
                <div className="h-32 bg-linear-to-r from-[#1E3A5F] via-[#2B6CB0] to-[#1E3A5F] relative">
                    {isEditing && (
                        <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-lg">
                            <Camera className="text-white" size={20} />
                        </button>
                    )}
                </div>

                <div className="px-8 pb-8">
                    {/* Avatar */}
                    <div className="relative -mt-16 mb-6">
                        <div className="w-32 h-32 rounded-full bg-linear-to-br from-[#2B6CB0] to-[#1E3A5F] flex items-center justify-center text-white text-4xl border-4 border-white">
                            {profileData.name.charAt(0)}
                        </div>
                        {isEditing && (
                            <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full">
                                <Camera size={18} className="text-[#2B6CB0]" />
                            </button>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        {/* Name */}
                        {isEditing ? (
                            <>
                                <Input
                                    value={profileData.name}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, name: e.target.value })
                                    }
                                    placeholder="Nombre completo"
                                />
                                <Input
                                    value={profileData.title}
                                    disabled // Rol no editable
                                    className="bg-gray-100"
                                />
                            </>
                        ) : (
                            <>
                                <h2>{profileData.name}</h2>
                                <p className="text-[#2B6CB0]">{profileData.title}</p>
                            </>
                        )}

                        {/* Contact */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field
                                icon={<MapPin size={20} />}
                                value={profileData.location}
                                isEditing={isEditing}
                                onChange={(v) =>
                                    setProfileData({ ...profileData, location: v })
                                }
                                placeholder="Ciudad, Departamento"
                            />
                            <Field
                                icon={<Mail size={20} />}
                                value={profileData.email}
                                isEditing={false} // Email no editable
                                placeholder="Correo electrónico"
                            />
                            <Field
                                icon={<Phone size={20} />}
                                value={profileData.phone}
                                isEditing={isEditing}
                                onChange={(v) =>
                                    setProfileData({ ...profileData, phone: v })
                                }
                                placeholder="Teléfono"
                            />
                            {/* Website - Placeholder */}
                            {/* <Field
                icon={<Globe size={20} />}
                value={profileData.website}
                isEditing={isEditing}
                onChange={(v) =>
                  setProfileData({ ...profileData, website: v })
                }
              /> */}
                        </div>

                        {/* Bio - Placeholder */}
                        {/* <div>
              <h3>Acerca de mí</h3>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                />
              ) : (
                <p className="text-gray-500">{profileData.bio}</p>
              )}
            </div> */}

                        {/* Skills - Placeholder */}
                        {/* <div>
              <h3>Habilidades</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, i) => (
                  <Badge key={i}>
                    {skill}
                    {isEditing && (
                      <X
                        size={14}
                        className="ml-2 cursor-pointer"
                        onClick={() =>
                          setProfileData({
                            ...profileData,
                            skills: profileData.skills.filter(
                              (_, idx) => idx !== i
                            ),
                          })
                        }
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </div> */}
                    </div>
                </div>
            </div>

            {/* Stats - Placeholder */}
            <div className="grid md:grid-cols-3 gap-6">
                <Stat
                    icon={<Briefcase className="text-white" />}
                    value={profileData.projectsCompleted}
                    label="Proyectos"
                />
                <Stat
                    icon={<span className="text-white">⭐</span>}
                    value={profileData.rating}
                    label="Calificación"
                />
                <Stat
                    icon={<Calendar className="text-white" />}
                    value={profileData.experience || "N/A"}
                    label="Experiencia"
                />
            </div>
        </div>
    );
}

/* Helpers */

function Field({ icon, value, isEditing, onChange, placeholder }) {
    return (
        <div className="flex items-center gap-3">
            {icon}
            {isEditing ? (
                <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
            ) : (
                <span>{value || <span className="text-gray-400 italic">No definido</span>}</span>
            )}
        </div>
    );
}

function Stat({ icon, value, label }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-[#2B6CB0] to-[#1E3A5F] rounded-xl">
                    {icon}
                </div>
                <span className="text-3xl">{value}</span>
            </div>
            <h4>{label}</h4>
        </div>
    );
}
