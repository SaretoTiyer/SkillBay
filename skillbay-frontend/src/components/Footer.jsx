import React from "react";
import {
Facebook,
Twitter,
Instagram,
Linkedin,
Mail,
Phone,
MapPin,
} from "lucide-react";
import logoIcon from "../assets/IconoSkillBay.png"; // ajusta si tu logo está en otro path

const Footer = ({ onNavigate }) => {
return (
    <footer className="bg-[#1E3A5F] text-white mt-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo y descripción */}
        <div className="col-span-1 md:col-span-2">
            <div
            className="cursor-pointer flex items-center gap-3 mb-4"
            onClick={() => onNavigate("home")}
            >
            <img src={logoIcon} alt="SkillBay Icon" className="h-14" />
            <span className="text-2xl font-semibold tracking-wide">SkillBay</span>
            </div>
            <p className="text-[#A0AEC0] mb-3 leading-relaxed">
            SkillBay conecta talento y necesidad. La plataforma de confianza
            para contratar u ofrecer servicios en Colombia.
            </p>
            <p className="text-[#A0AEC0] italic">
            “Tú lo imaginas, ellos lo crean.”
            </p>
        </div>

        {/* Enlaces Rápidos */}
        <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
            <li>
                <button
                onClick={() => onNavigate("home")}
                className="text-[#A0AEC0] hover:text-white transition-colors"
                >
                Inicio
                </button>
            </li>
            <li>
                <button
                onClick={() => onNavigate("services")}
                className="text-[#A0AEC0] hover:text-white transition-colors"
                >
                Servicios
                </button>
            </li>
            <li>
                <button
                onClick={() => onNavigate("about")}
                className="text-[#A0AEC0] hover:text-white transition-colors"
                >
                Sobre Nosotros
                </button>
            </li>
            <li>
                <button
                onClick={() => onNavigate("contact")}
                className="text-[#A0AEC0] hover:text-white transition-colors"
                >
                Contacto
                </button>
            </li>
            </ul>
        </div>

        {/* Contacto */}
        <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
            <li className="flex items-center gap-2 text-[#A0AEC0]">
                <Mail size={18} />
                <span>contacto@skillbay.co</span>
            </li>
            <li className="flex items-center gap-2 text-[#A0AEC0]">
                <Phone size={18} />
                <span>+57 300 123 4567</span>
            </li>
            <li className="flex items-center gap-2 text-[#A0AEC0]">
                <MapPin size={18} />
                <span>Colombia</span>
            </li>
            </ul>
        </div>
        </div>

        {/* Línea divisoria */}
        <div className="mt-12 pt-8 border-t border-[#2B6CB0]/40">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#A0AEC0] text-sm">
            © {new Date().getFullYear()} SkillBay. Todos los derechos
            reservados.
            </p>

            <div className="flex gap-4">
            <a
                href="#"
                className="bg-[#2B6CB0] p-2 rounded-full hover:bg-[#2563a7] transition-colors"
                aria-label="Facebook"
            >
                <Facebook size={20} />
            </a>
            <a
                href="#"
                className="bg-[#2B6CB0] p-2 rounded-full hover:bg-[#2563a7] transition-colors"
                aria-label="Twitter"
            >
                <Twitter size={20} />
            </a>
            <a
                href="#"
                className="bg-[#2B6CB0] p-2 rounded-full hover:bg-[#2563a7] transition-colors"
                aria-label="Instagram"
            >
                <Instagram size={20} />
            </a>
            <a
                href="#"
                className="bg-[#2B6CB0] p-2 rounded-full hover:bg-[#2563a7] transition-colors"
                aria-label="LinkedIn"
            >
                <Linkedin size={20} />
            </a>
            </div>
        </div>
        </div>
    </div>
    </footer>
);
};

export default Footer;
