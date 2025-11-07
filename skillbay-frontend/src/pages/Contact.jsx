import React, { useState } from "react";
import {
Mail,
Phone,
MapPin,
Send,
MessageCircle,
Clock,
HelpCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Label } from "../components/ui/Label";

const Contact = () => {
const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
});

const handleSubmit = (e) => {
    e.preventDefault();
    alert("¡Mensaje enviado! Nos pondremos en contacto contigo pronto.");
    setFormData({ name: "", email: "", subject: "", message: "" });
};

const handleChange = (e) => {
    setFormData({
    ...formData,
    [e.target.name]: e.target.value,
    });
};

const contactInfo = [
    {
    icon: Mail,
    title: "Email",
    lines: ["contacto@skillbay.co", "soporte@skillbay.co"],
    color: "from-blue-500 to-blue-600",
    },
    {
    icon: Phone,
    title: "Teléfono",
    lines: ["+57 300 123 4567", "Lun - Vie: 8:00 AM - 6:00 PM"],
    color: "from-green-500 to-green-600",
    },
    {
    icon: MapPin,
    title: "Ubicación",
    lines: ["Colombia", "Servicio a nivel nacional"],
    color: "from-purple-500 to-purple-600",
    },
];

const faqs = [
    {
    question: "¿Cómo me registro en SkillBay?",
    answer:
        'Haz clic en "Registrarse" y llena tus datos básicos. El proceso toma menos de 2 minutos.',
    },
    {
    question: "¿Es seguro contratar servicios en SkillBay?",
    answer:
        "Sí, todos nuestros proveedores son verificados y contamos con un sistema de calificaciones transparente.",
    },
    {
    question: "¿Cuánto cuesta usar SkillBay?",
    answer:
        "Registrarse y buscar servicios es gratis. Los proveedores pueden acceder a planes premium opcionales.",
    },
];

return (
    <div className="min-h-screen pt-20">
    {/* === Sección Hero === */}
    <section className="relative overflow-hidden bg-linear-to-br from-[#0f2744] via-[#1E3A5F] to-[#2B6CB0] text-white">
        <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#2B6CB0] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#1E3A5F] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="absolute inset-0 opacity-5">
        <div
            className="absolute inset-0"
            style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
        ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <MessageCircle className="text-blue-300" size={18} />
            <span className="text-sm">Estamos aquí para ayudarte</span>
            </div>

            <h1 className="mb-6 bg-linear-to-r from-white via-white to-blue-100 bg-clip-text text-transparent">
            Contáctanos
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            ¿Tienes alguna pregunta o necesitas ayuda?{" "}
            <span className="text-white">Estamos aquí para ti.</span>
            </p>
        </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
        <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
            />
        </svg>
        </div>
    </section>

    {/* === Tarjetas de información === */}
    <section className="py-16 bg-white relative -mt-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
                <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-[#E2E8F0] hover:border-transparent transform hover:-translate-y-2"
                >
                <div
                    className={`absolute inset-0 bg-linear-to-br ${info.color} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300`}
                ></div>

                <div className="relative">
                    <div
                    className={`bg-linear-to-br ${info.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                    >
                    <Icon className="text-white" size={28} />
                    </div>
                    <h3 className="mb-3 text-[#1E3A5F] group-hover:text-white transition-colors">
                    {info.title}
                    </h3>
                    {info.lines.map((line, idx) => (
                    <p
                        key={idx}
                        className="text-[#A0AEC0] group-hover:text-white/90 transition-colors"
                    >
                        {line}
                    </p>
                    ))}
                </div>
                </div>
            );
            })}
        </div>
        </div>
    </section>

    {/* Formulario y información de contacto */}
    <section className="py-24 bg-linear-to-br from-white to-[#E2E8F0] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2B6CB0]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1E3A5F]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12">
            {/* Información adicional */}
            <div className="lg:col-span-2 space-y-8">
            <div>
                <div className="inline-block px-4 py-2 bg-blue-100 text-[#2B6CB0] rounded-full mb-6">
                Información de contacto
                </div>
                <h2 className="mb-6 text-[#1E3A5F]">Hablemos</h2>
                <p className="text-[#A0AEC0] text-lg leading-relaxed mb-8">
                Nuestro equipo está listo para responder tus preguntas y ayudarte en lo que necesites.
                </p>
            </div>

            {/* Horarios de Atención Mejorado */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-[#E2E8F0]">
                <div className="flex items-center gap-3 mb-6">
                <div className="bg-linear-to-br from-[#2B6CB0] to-[#1e5a94] w-12 h-12 rounded-xl flex items-center justify-center">
                    <Clock className="text-white" size={24} />
                </div>
                <h3 className="text-[#1E3A5F]">Horarios de Atención</h3>
                </div>
                <div className="space-y-3 text-[#A0AEC0]">
                <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
                    <span>Lunes - Viernes:</span>
                    <span>8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
                    <span>Sábados:</span>
                    <span>9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between py-2">
                    <span>Domingos:</span>
                    <span>Cerrado</span>
                </div>
                </div>
            </div>

            {/* Tiempo de respuesta */}
            <div className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-2xl">
                <p className="text-[#1E3A5F]">
                <span className="block mb-2">⚡ Tiempo de respuesta promedio:</span>
                <span className="text-[#2B6CB0]">2-4 horas en horario laboral</span>
                </p>
            </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-[#E2E8F0]">
                <div className="flex items-center gap-3 mb-8">
                <div className="bg-linear-to-br from-[#2B6CB0] to-[#1e5a94] w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="text-white" size={28} />
                </div>
                <div>
                    <h2 className="text-[#1E3A5F]">Envíanos un Mensaje</h2>
                    <p className="text-[#A0AEC0]">Completa el formulario y te responderemos pronto</p>
                </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div>
                    <Label htmlFor="name" className="text-[#1E3A5F] mb-2 block">
                    Nombre Completo
                    </Label>
                    <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="border-2 border-[#E2E8F0] focus:border-[#2B6CB0] focus:ring-[#2B6CB0] h-12 rounded-xl"
                    placeholder="Tu nombre"
                    />
                </div>

                {/* Email */}
                <div>
                    <Label htmlFor="email" className="text-[#1E3A5F] mb-2 block">
                    Correo Electrónico
                    </Label>
                    <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="border-2 border-[#E2E8F0] focus:border-[#2B6CB0] focus:ring-[#2B6CB0] h-12 rounded-xl"
                    placeholder="tu@email.com"
                    />
                </div>

                {/* Asunto */}
                <div>
                    <Label htmlFor="subject" className="text-[#1E3A5F] mb-2 block">
                    Asunto
                    </Label>
                    <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="border-2 border-[#E2E8F0] focus:border-[#2B6CB0] focus:ring-[#2B6CB0] h-12 rounded-xl"
                    placeholder="¿En qué podemos ayudarte?"
                    />
                </div>

                {/* Mensaje */}
                <div>
                    <Label htmlFor="message" className="text-[#1E3A5F] mb-2 block">
                    Mensaje
                    </Label>
                    <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="border-2 border-[#E2E8F0] focus:border-[#2B6CB0] focus:ring-[#2B6CB0] rounded-xl"
                    placeholder="Escribe tu mensaje aquí..."
                    />
                </div>

                {/* Botón de Enviar */}
                <Button
                    type="submit"
                    className="w-full bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] hover:from-[#2563a7] hover:to-[#1a4d7f] text-white py-7 text-lg rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#2B6CB0]/30 transition-all duration-300"
                >
                    <Send size={20} className="mr-2" />
                    Enviar Mensaje
                </Button>
                </form>
            </div>
            </div>
        </div>
        </div>
    </section>

    {/* FAQ Mejorado */}
    <section className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#2B6CB0]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full mb-4">
            <HelpCircle className="inline mr-2" size={16} />
            FAQ
            </div>
            <h2 className="mb-4 text-[#1E3A5F]">Preguntas Frecuentes</h2>
            <p className="text-[#A0AEC0] text-lg">
            Encuentra respuestas rápidas a las preguntas más comunes
            </p>
        </div>

        <div className="space-y-6">
            {faqs.map((faq, index) => (
            <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#E2E8F0] hover:border-[#2B6CB0]"
            >
                <h3 className="mb-4 text-[#1E3A5F] group-hover:text-[#2B6CB0] transition-colors">
                {faq.question}
                </h3>
                <p className="text-[#A0AEC0] leading-relaxed text-lg">
                {faq.answer}
                </p>
            </div>
            ))}
        </div>

        {/* CTA para más preguntas */}
        <div className="mt-12 text-center">
            <p className="text-[#A0AEC0] mb-4">¿No encuentras lo que buscas?</p>
            <button className="px-8 py-3 bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] text-white rounded-xl hover:shadow-lg hover:shadow-[#2B6CB0]/30 transition-all duration-300">
            Ver todas las preguntas frecuentes
            </button>
        </div>
        </div>
    </section>
    </div>
);
};

export default Contact;
