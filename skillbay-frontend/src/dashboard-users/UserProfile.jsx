import { useState } from "react";
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

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea} from "../components/ui/Textarea";
import { Badge } from "../components/ui/badge";

export default function UserProfile() {
const [isEditing, setIsEditing] = useState(false);

const [profileData, setProfileData] = useState({
    name: "Carlos Rodríguez",
    title: "Desarrollador Full Stack & Diseñador UI/UX",
    location: "Bogotá, Colombia",
    email: "carlos.rodriguez@email.com",
    phone: "+57 300 123 4567",
    website: "www.carlosdev.com",
    bio: "Desarrollador apasionado con más de 5 años de experiencia en tecnologías web modernas. Especializado en React, Node.js y diseño de interfaces intuitivas.",
    skills: ["React", "Node.js", "TypeScript", "Tailwind CSS", "Figma", "MongoDB"],
    experience: "5+ años",
    projectsCompleted: 47,
    rating: 4.9,
    languages: ["Español (Nativo)", "Inglés (Avanzado)"],
});

const handleSave = () => {
    setIsEditing(false);
    // aquí luego conectamos backend
};

const handleCancel = () => {
    setIsEditing(false);
    // aquí podrías restaurar estado original si quieres
};

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
            CR
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
                />
                <Input
                value={profileData.title}
                onChange={(e) =>
                    setProfileData({ ...profileData, title: e.target.value })
                }
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
            />
            <Field
                icon={<Mail size={20} />}
                value={profileData.email}
                isEditing={isEditing}
                onChange={(v) =>
                setProfileData({ ...profileData, email: v })
                }
            />
            <Field
                icon={<Phone size={20} />}
                value={profileData.phone}
                isEditing={isEditing}
                onChange={(v) =>
                setProfileData({ ...profileData, phone: v })
                }
            />
            <Field
                icon={<Globe size={20} />}
                value={profileData.website}
                isEditing={isEditing}
                onChange={(v) =>
                setProfileData({ ...profileData, website: v })
                }
            />
            </div>

            {/* Bio */}
            <div>
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
            </div>

            {/* Skills */}
            <div>
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
            </div>
        </div>
        </div>
    </div>

    {/* Stats */}
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
        value={profileData.experience}
        label="Experiencia"
        />
    </div>
    </div>
);
}

/* Helpers */

function Field({ icon, value, isEditing, onChange }) {
return (
    <div className="flex items-center gap-3">
    {icon}
    {isEditing ? (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
    ) : (
        <span>{value}</span>
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
