import React from "react";
import {
Target,
Eye,
Heart,
Users,
CheckCircle,
Award,
Shield,
Sparkles,
} from "lucide-react";

const About = () => {
const values = [
    {
    icon: Heart,
    title: "Confianza",
    description:
        "Construimos relaciones basadas en la transparencia y la honestidad.",
    color: "from-red-500 to-pink-500",
    },
    {
    icon: Users,
    title: "Comunidad",
    description:
        "Creemos en el poder de conectar personas con talento y necesidades.",
    color: "from-purple-500 to-indigo-500",
    },
    {
    icon: CheckCircle,
    title: "Calidad",
    description:
        "Nos comprometemos con la excelencia en cada servicio ofrecido.",
    color: "from-green-500 to-emerald-500",
    },
];

const commitments = [
    { title: "Verificación", subtitle: "de proveedores", icon: Shield },
    { title: "Protección", subtitle: "de datos personales", icon: CheckCircle },
    { title: "Soporte", subtitle: "continuo 24/7", icon: Award },
];

return (
    <div className="min-h-screen pt-20">
    {/* HERO */}
    <section className="relative overflow-hidden bg-linear-to-br from-[#0f2744] via-[#1E3A5F] to-[#2B6CB0] text-white">
        <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#2B6CB0] rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#1E3A5F] rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="absolute inset-0 opacity-5">
        <div
            className="absolute inset-0"
            style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
        ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <Sparkles className="text-yellow-300" size={18} />
            <span className="text-sm">Conectando Colombia desde 2024</span>
        </div>

        <h1 className="mb-6 bg-linear-to-r from-white via-white to-blue-100 bg-clip-text text-transparent text-4xl md:text-6xl font-bold">
            Sobre SkillBay
        </h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Conectando talento colombiano con quienes necesitan servicios de
            calidad.{" "}
            <span className="text-white">
            Nuestra misión es crear una comunidad donde todos puedan crecer.
            </span>
        </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
        <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H0Z"
            fill="white"
            />
        </svg>
        </div>
    </section>

    {/* HISTORIA */}
    <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2B6CB0]/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
        <div>
            <div className="inline-block px-4 py-2 bg-blue-100 text-[#2B6CB0] rounded-full mb-6">
            Nuestra Historia
            </div>
            <h2 className="mb-6 text-[#1E3A5F] text-3xl font-bold">
            De una idea a una comunidad
            </h2>
            <p className="mb-6 text-[#A0AEC0] leading-relaxed text-lg">
            SkillBay nació de la necesidad de crear un espacio seguro y
            confiable donde los colombianos puedan conectar sus habilidades
            con quienes las necesitan.
            </p>
            <p className="mb-6 text-[#A0AEC0] leading-relaxed text-lg">
            Entendemos que encontrar servicios de calidad puede ser difícil, y
            que muchos profesionales talentosos no tienen la visibilidad que
            merecen.
            </p>
            <p className="text-[#A0AEC0] leading-relaxed text-lg">
            Hoy, somos una comunidad en crecimiento que transforma la manera
            en que los colombianos acceden y ofrecen servicios.
            </p>

            <div className="grid grid-cols-3 gap-6 mt-10">
            <div className="text-center p-4 bg-[#E2E8F0] rounded-xl">
                <div className="text-[#2B6CB0] mb-1 text-xl font-semibold">
                10K+
                </div>
                <p className="text-[#A0AEC0] text-sm">Usuarios</p>
            </div>
            <div className="text-center p-4 bg-[#E2E8F0] rounded-xl">
                <div className="text-[#2B6CB0] mb-1 text-xl font-semibold">
                5K+
                </div>
                <p className="text-[#A0AEC0] text-sm">Servicios</p>
            </div>
            <div className="text-center p-4 bg-[#E2E8F0] rounded-xl">
                <div className="text-[#2B6CB0] mb-1 text-xl font-semibold">
                4.8/5
                </div>
                <p className="text-[#A0AEC0] text-sm">Rating</p>
            </div>
            </div>
        </div>

        <div className="relative group">
            <div className="absolute -inset-4 bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition duration-500">
            <img
                src="https://images.unsplash.com/photo-1607110654203-d5665bd64105?auto=format&fit=crop&w=1080&q=80"
                alt="Nuestra Historia"
                className="w-full h-[500px] object-cover"
            />
            </div>
        </div>
        </div>
    </section>

    {/* MISIÓN Y VISIÓN */}
    <section className="py-24 bg-linear-to-br from-[#E2E8F0] to-white">
        <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-[#2B6CB0]/10 text-[#2B6CB0] rounded-full mb-4">
            Nuestro Propósito
            </div>
            <h2 className="text-[#1E3A5F] text-3xl font-bold mb-4">
            Misión y Visión
            </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Misión */}
            <div className="group bg-white p-12 rounded-3xl shadow-xl hover:shadow-2xl border-2 hover:border-[#2B6CB0] transform hover:-translate-y-3 transition">
            <div className="bg-linear-to-br from-[#2B6CB0] to-[#1e5a94] w-24 h-24 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-xl group-hover:scale-110 transition">
                <Target className="text-white" size={40} />
            </div>
            <h3 className="mb-6 text-[#1E3A5F] text-xl font-semibold text-center">
                Nuestra Misión
            </h3>
            <p className="text-[#A0AEC0] leading-relaxed text-lg text-center">
                Facilitar conexiones seguras y confiables entre personas que
                buscan servicios y profesionales que desean ofrecer su talento.
            </p>
            </div>

            {/* Visión */}
            <div className="group bg-white p-12 rounded-3xl shadow-xl hover:shadow-2xl border-2 hover:border-[#2B6CB0] transform hover:-translate-y-3 transition">
            <div className="bg-linear-to-br from-purple-500 to-purple-600 w-24 h-24 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-xl group-hover:scale-110 transition">
                <Eye className="text-white" size={40} />
            </div>
            <h3 className="mb-6 text-[#1E3A5F] text-xl font-semibold text-center">
                Nuestra Visión
            </h3>
            <p className="text-[#A0AEC0] leading-relaxed text-lg text-center">
                Ser la plataforma líder en Colombia para la contratación de
                servicios, reconocida por confiabilidad y compromiso con la
                excelencia.
            </p>
            </div>
        </div>
        </div>
    </section>

    {/* VALORES */}
    <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-[#2B6CB0] rounded-full mb-4">
            Lo que nos define
            </div>
            <h2 className="text-[#1E3A5F] text-3xl font-bold mb-4">
            Nuestros Valores
            </h2>
            <p className="text-[#A0AEC0] text-lg max-w-2xl mx-auto">
            Los principios que guían cada decisión que tomamos en SkillBay.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, title, description, color }, i) => (
            <div
                key={i}
                className="group relative bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition border-2 border-[#E2E8F0] hover:border-transparent transform hover:-translate-y-3"
            >
                <div
                className={`absolute inset-0 bg-linear-to-br ${color} opacity-0 group-hover:opacity-100 rounded-3xl transition`}
                ></div>
                <div className="relative text-center">
                <div
                    className={`bg-linear-to-br ${color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition`}
                >
                    <Icon className="text-white" size={32} />
                </div>
                <h3 className="mb-4 text-[#1E3A5F] group-hover:text-white transition">
                    {title}
                </h3>
                <p className="text-[#A0AEC0] group-hover:text-white/90 transition">
                    {description}
                </p>
                </div>
            </div>
            ))}
        </div>
        </div>
    </section>

    {/* COMPROMISO */}
    <section className="relative py-28 bg-linear-to-r from-[#0f2744] via-[#1E3A5F] to-[#2B6CB0] text-white">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <Sparkles className="mx-auto mb-6 text-yellow-300" size={48} />
        <h2 className="mb-6 text-3xl font-bold">
            Nuestro Compromiso Contigo
        </h2>
        <p className="mb-12 text-blue-100 text-xl max-w-3xl mx-auto">
            En SkillBay, nos comprometemos a proporcionar una plataforma segura,
            confiable y eficiente. Verificamos a nuestros proveedores, protegemos
            tus datos y trabajamos constantemente para mejorar tu experiencia.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
            {commitments.map(({ title, subtitle, icon: Icon }, i) => (
            <div
                key={i}
                className="relative group backdrop-blur-sm bg-white/10 border border-white/20 p-8 rounded-2xl hover:bg-white/15 transition hover:scale-110"
            >
                <Icon
                className="mx-auto mb-4 text-blue-300 group-hover:text-white transition"
                size={40}
                />
                <div className="mb-2 text-lg font-semibold">{title}</div>
                <p className="text-blue-200">{subtitle}</p>
            </div>
            ))}
        </div>
        </div>
    </section>
    </div>
);
};

export default About;
