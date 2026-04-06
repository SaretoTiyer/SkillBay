import React, { useState } from "react";
import {
Mail,
Phone,
MapPin,
Send,
MessageCircle,
Clock,
HelpCircle,
Loader2,
CheckCircle,
AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Label } from "../components/ui/Label";
import { API_URL } from "../config/api";

const Contact = () => {
const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
});
const [errors, setErrors] = useState({});
const [submitting, setSubmitting] = useState(false);
const [submitStatus, setSubmitStatus] = useState(null);

const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
        newErrors.name = "El nombre debe tener al menos 2 caracteres.";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Ingresa un correo electronico valido.";
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
        newErrors.subject = "El asunto debe tener al menos 3 caracteres.";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
        newErrors.message = "El mensaje debe tener al menos 10 caracteres.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    setErrors({});

    if (!validate()) return;

    setSubmitting(true);
    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                name: formData.name.trim(),
                email: formData.email.trim(),
                subject: formData.subject.trim(),
                message: formData.message.trim(),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.errors) {
                const fieldErrors = {};
                Object.entries(data.errors).forEach(([field, messages]) => {
                    fieldErrors[field] = messages[0];
                });
                setErrors(fieldErrors);
            }
            throw new Error(data.message || "Error al enviar el mensaje.");
        }

        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
        setSubmitStatus("error");
    } finally {
        setSubmitting(false);
    }
};

const handleChange = (e) => {
    setFormData({
    ...formData,
    [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
};

const contactInfo = [
    {
    icon: Mail,
    title: "Email",
    lines: ["skillbay.app@gmail.com", "Respuesta en 2-4 horas"],
    color: "from-blue-500 to-blue-600",
    },
    {
    icon: Clock,
    title: "Horario de Atencion",
    lines: ["Lun - Vie: 8:00 AM - 6:00 PM", "Sab: 9:00 AM - 2:00 PM"],
    color: "from-green-500 to-green-600",
    },
    {
    icon: MapPin,
    title: "Ubicacion",
    lines: ["Colombia", "Plataforma 100% digital"],
    color: "from-purple-500 to-purple-600",
    },
];

const faqs = [
    {
    question: "Como me registro en SkillBay?",
    answer:
        'Haz clic en "Registrarse" en la parte superior, completa tus datos basicos y elige un plan. El proceso toma menos de 2 minutos y puedes empezar a explorar de inmediato.',
    },
    {
    question: "Como publico un servicio u oportunidad?",
    answer:
        "Una vez registrado, accede a tu panel y selecciona 'Mis Servicios'. Alli podras crear nuevos servicios u oportunidades, definir precio, categoria y descripcion.",
    },
    {
    question: "Es seguro contratar en SkillBay?",
    answer:
        "Si. Contamos con un sistema de calificaciones transparente, verificacion de usuarios y un proceso de pago seguro. Ademas, puedes reportar cualquier actividad sospechosa.",
    },
    {
    question: "Cuantp cuesta usar SkillBay?",
    answer:
        "Registrarse y explorar es gratis. Ofrecemos planes premium para quienes desean mayor visibilidad y funciones avanzadas. Consulta la seccion de planes para mas detalles.",
    },
    {
    question: "Como funciona el sistema de postulaciones?",
    answer:
        "Cuando encuentras un servicio u oportunidad que te interesa, puedes enviarnos una postulacion con un mensaje. El creador revisara tu perfil y mensaje para decidir si acepta tu solicitud.",
    },
];

return (
    <div className="min-h-screen pt-20">
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
            <span className="text-sm">Estamos aqui para ayudarte</span>
            </div>

            <h1 className="mb-6 bg-linear-to-r from-white via-white to-blue-100 bg-clip-text text-transparent">
            Contactanos
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Tienes alguna pregunta o necesitas ayuda?{" "}
            <span className="text-white">Estamos aqui para ti.</span>
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

    <section className="py-24 bg-linear-to-br from-white to-[#E2E8F0] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2B6CB0]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1E3A5F]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
            <div>
                <div className="inline-block px-4 py-2 bg-blue-100 text-[#2B6CB0] rounded-full mb-6">
                Informacion de contacto
                </div>
                <h2 className="mb-6 text-[#1E3A5F]">Hablemos</h2>
                <p className="text-[#A0AEC0] text-lg leading-relaxed mb-8">
                Nuestro equipo esta listo para responder tus preguntas y ayudarte en lo que necesites.
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-[#E2E8F0]">
                <div className="flex items-center gap-3 mb-6">
                <div className="bg-linear-to-br from-[#2B6CB0] to-[#1e5a94] w-12 h-12 rounded-xl flex items-center justify-center">
                    <Clock className="text-white" size={24} />
                </div>
                <h3 className="text-[#1E3A5F]">Horarios de Atencion</h3>
                </div>
                <div className="space-y-3 text-[#A0AEC0]">
                <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
                    <span>Lunes - Viernes:</span>
                    <span>8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
                    <span>Sabados:</span>
                    <span>9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between py-2">
                    <span>Domingos:</span>
                    <span>Cerrado</span>
                </div>
                </div>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-2xl">
                <p className="text-[#1E3A5F]">
                <span className="block mb-2">Tiempo de respuesta promedio:</span>
                <span className="text-[#2B6CB0]">2-4 horas en horario laboral</span>
                </p>
                <p className="text-[#A0AEC0] text-sm mt-2">
                  Tambien puedes escribirnos a <strong className="text-[#2B6CB0]">skillbay.app@gmail.com</strong>
                </p>
            </div>
            </div>

            <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-[#E2E8F0]">
                <div className="flex items-center gap-3 mb-8">
                <div className="bg-linear-to-br from-[#2B6CB0] to-[#1e5a94] w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="text-white" size={28} />
                </div>
                <div>
                    <h2 className="text-[#1E3A5F]">Envianos un Mensaje</h2>
                    <p className="text-[#A0AEC0]">Completa el formulario y te responderemos pronto</p>
                </div>
                </div>

                {submitStatus === "success" && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                        <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                            <p className="text-green-800 font-semibold">Mensaje enviado correctamente</p>
                            <p className="text-green-600 text-sm">Nos pondremos en contacto contigo pronto.</p>
                        </div>
                    </div>
                )}

                {submitStatus === "error" && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                            <p className="text-red-800 font-semibold">Error al enviar el mensaje</p>
                            <p className="text-red-600 text-sm">Intentalo de nuevo mas tarde.</p>
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                    <Label htmlFor="name" className="text-[#1E3A5F] mb-2 block">
                    Nombre Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`border-2 focus:ring-[#2B6CB0] h-12 rounded-xl ${errors.name ? "border-red-400 focus:border-red-400" : "border-[#E2E8F0] focus:border-[#2B6CB0]"}`}
                    placeholder="Tu nombre"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <Label htmlFor="email" className="text-[#1E3A5F] mb-2 block">
                    Correo Electronico <span className="text-red-500">*</span>
                    </Label>
                    <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`border-2 focus:ring-[#2B6CB0] h-12 rounded-xl ${errors.email ? "border-red-400 focus:border-red-400" : "border-[#E2E8F0] focus:border-[#2B6CB0]"}`}
                    placeholder="tu@email.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <Label htmlFor="subject" className="text-[#1E3A5F] mb-2 block">
                    Asunto <span className="text-red-500">*</span>
                    </Label>
                    <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`border-2 focus:ring-[#2B6CB0] h-12 rounded-xl ${errors.subject ? "border-red-400 focus:border-red-400" : "border-[#E2E8F0] focus:border-[#2B6CB0]"}`}
                    placeholder="En que podemos ayudarte?"
                    />
                    {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                </div>

                <div>
                    <Label htmlFor="message" className="text-[#1E3A5F] mb-2 block">
                    Mensaje <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`border-2 focus:ring-[#2B6CB0] rounded-xl ${errors.message ? "border-red-400 focus:border-red-400" : "border-[#E2E8F0] focus:border-[#2B6CB0]"}`}
                    placeholder="Escribe tu mensaje aqui..."
                    />
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] hover:from-[#2563a7] hover:to-[#1a4d7f] text-white py-7 text-lg rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#2B6CB0]/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={20} className="mr-2 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send size={20} className="mr-2" />
                            Enviar Mensaje
                        </>
                    )}
                </Button>
                </form>
            </div>
            </div>
        </div>
        </div>
    </section>

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
            Encuentra respuestas rapidas a las preguntas mas comunes
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

        <div className="mt-12 text-center">
            <p className="text-[#A0AEC0] mb-4">No encuentras lo que buscas?</p>
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
