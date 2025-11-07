import React from "react";
import {
Search,
Briefcase,
Shield,
Users,
TrendingUp,
Star,
Sparkles,
Award,
Clock,
CheckCircle2,
} from "lucide-react";

const Home = ({ onNavigate }) => {
const categories = [
    { name: "Tecnología", icon: "💻", color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { name: "Cuidado del Hogar", icon: "🏠", color: "from-green-500 to-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
    { name: "Educación", icon: "📚", color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    { name: "Servicios Generales", icon: "🔧", color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    { name: "Eventos", icon: "🎉", color: "from-pink-500 to-pink-600", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
    { name: "Oficios Manuales", icon: "🛠️", color: "from-yellow-500 to-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
];

const stats = [
    { label: "Usuarios Registrados", value: "10,000+", icon: Users },
    { label: "Servicios Completados", value: "5,000+", icon: Briefcase },
    { label: "Calificación Promedio", value: "4.8/5", icon: Star },
    { label: "Crecimiento Mensual", value: "25%", icon: TrendingUp },
];

const features = [
    { icon: Shield, title: "Seguridad Garantizada", description: "Todos los proveedores verificados" },
    { icon: Award, title: "Calidad Certificada", description: "Sistema de calificaciones real" },
    { icon: Clock, title: "Respuesta Rápida", description: "Contacto inmediato con expertos" },
    { icon: CheckCircle2, title: "Pago Seguro", description: "Transacciones protegidas" },
];

return (
    <div className="min-h-screen">
    {/* Hero Section */}
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#1E3A5F] to-[#2B6CB0] text-white">
        {/* Fondos decorativos */}
        <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#2B6CB0] rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#1E3A5F] rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[#2B6CB0] rounded-full blur-3xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <Sparkles className="text-yellow-300" size={18} />
            <span className="text-sm">La plataforma de servicios más confiable de Colombia</span>
        </div>

        <h1 className="mb-6 bg-gradient-to-r from-white via-white to-blue-100 bg-clip-text text-transparent">
            Conecta talento y necesidad. Contrata o ofrece servicios con confianza.
        </h1>
        <p className="mb-10 text-xl text-blue-100 max-w-3xl mx-auto">
            SkillBay conecta a colombianos que buscan servicios de calidad con profesionales talentosos.{" "}
            <span className="text-white">Tú lo imaginas, ellos lo crean.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
            <button
            onClick={() => onNavigate("services")}
            className="group px-10 py-5 bg-white text-[#1E3A5F] rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
            >
            <Search size={22} />
            Buscar Servicios
            </button>

            <button
            onClick={() => onNavigate("register")}
            className="group px-10 py-5 bg-gradient-to-r from-[#2B6CB0] to-[#1e5a94] text-white rounded-xl hover:from-[#2563a7] hover:to-[#1a4d7f] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
            >
            <Briefcase size={22} />
            Ofrecer Mi Servicio
            </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
                <div
                key={i}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105"
                >
                <Icon className="mx-auto mb-2 text-blue-300" size={24} />
                <p className="text-xs text-blue-100">{feature.title}</p>
                </div>
            );
            })}
        </div>
        </div>
    </section>

    {/* Categorías */}
    <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="inline-block px-4 py-2 bg-blue-100 text-[#2B6CB0] rounded-full mb-4">
            Categorías Populares
        </div>
        <h2 className="mb-4 text-[#1E3A5F]">Explora Nuestros Servicios</h2>
        <p className="text-[#A0AEC0] max-w-2xl mx-auto mb-12">
            Encuentra el servicio perfecto para ti o comparte tu talento.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
            <button
                key={i}
                onClick={() => onNavigate("services")}
                className={`group relative p-6 bg-white rounded-2xl border-2 ${cat.borderColor} hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 overflow-hidden`}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                <div className={`${cat.bgColor} w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                    <span className="text-4xl">{cat.icon}</span>
                </div>
                <p className="text-[#1E3A5F] group-hover:text-white transition-colors duration-300">{cat.name}</p>
                </div>
            </button>
            ))}
        </div>
        </div>
    </section>

    {/* Estadísticas */}
    <section className="py-24 bg-gradient-to-r from-[#0f2744] via-[#1E3A5F] to-[#2B6CB0] text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="mb-4">SkillBay en Números</h2>
        <p className="text-blue-100 mb-12">Resultados que hablan por sí mismos</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
                <div
                key={i}
                className="text-center p-8 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
                >
                <Icon className="mx-auto mb-4 text-blue-300" size={48} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-blue-200 text-sm">{stat.label}</p>
                </div>
            );
            })}
        </div>
        </div>
    </section>
    </div>
);
};

export default Home;
