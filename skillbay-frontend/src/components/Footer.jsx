import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import logoIcon from "../assets/resources/Logos/IconoSkillBay.png";

const Footer = () => {
return (
    <footer className="bg-[#1E3A5F] text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo y Descripción */}
        <div className="col-span-1 md:col-span-2">
            <img src={logoIcon} alt="SkillBay Icon" className="h-16 mb-4" />
            <p className="text-[#A0AEC0] mb-4">
            SkillBay conecta talento y necesidad. La plataforma de confianza para contratar u ofrecer servicios en Colombia.
            </p>
            <p className="text-[#A0AEC0]">Tú lo imaginas, ellos lo crean.</p>
        </div>

        {/* Enlaces Rápidos */}
        <div>
            <h3 className="mb-4 font-semibold text-lg">Enlaces Rápidos</h3>
            <ul className="space-y-2">
            <li>
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors">
                Inicio
                </a>
            </li>
            <li>
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors">
                Servicios
                </a>
            </li>
            <li>
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors">
                Sobre Nosotros
                </a>
            </li>
            <li>
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors">
                Contacto
                </a>
            </li>
            </ul>
        </div>

        {/* Contacto */}
        <div>
            <h3 className="mb-4 font-semibold text-lg">Contacto</h3>
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

        {/* Redes Sociales y Copyright */}
        <div className="mt-12 pt-8 border-t border-[#2B6CB0]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#A0AEC0] text-sm text-center md:text-left">
            © 2025 SkillBay. Todos los derechos reservados.
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
