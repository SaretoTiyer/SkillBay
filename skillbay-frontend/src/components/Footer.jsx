import React from "react";
import { Mail, Phone, MapPin, Shield, Heart, Users } from "lucide-react";
import logoIcon from "../assets/IconoSkillBayLight.png";

const Footer = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "Inicio", view: "home" },
    { label: "Servicios", view: "services" },
    { label: "Sobre Nosotros", view: "about" },
    { label: "Contacto", view: "contact" },
    { label: "Términos y Condiciones", view: "terms" },
  ];

  const trustItems = [
    { icon: Shield, label: "Plataforma verificada" },
    { icon: Heart, label: "Servicios de confianza" },
    { icon: Users, label: "Comunidad activa" },
  ];

  return (
    <footer
      className="bg-[#1E3A5F] text-white mt-12"
      role="contentinfo"
      aria-label="Pie de página de SkillBay"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <button
              onClick={() => onNavigate("home")}
              className="cursor-pointer flex items-center gap-3 mb-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E3A5F] rounded-lg px-1 py-1 -ml-1"
              aria-label="Ir al inicio de SkillBay"
            >
              <img src={logoIcon} alt="SkillBay Icon" className="h-14" />
              <span className="text-2xl font-semibold tracking-wide">
                SkillBay
              </span>
            </button>
            <p className="text-[#A0AEC0] mb-3 leading-relaxed max-w-md">
              SkillBay conecta talento y necesidad. La plataforma de confianza
              para contratar u ofrecer servicios en Colombia.
            </p>
            <p className="text-[#A0AEC0] italic">
              "Tú lo imaginas, ellos lo crean."
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mt-5">
              {trustItems.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm text-[#A0AEC0]"
                >
                  <Icon size={16} className="text-emerald-400 shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <nav aria-label="Navegación principal">
            <h3
              id="footer-nav-heading"
              className="text-lg font-semibold mb-4"
            >
              Enlaces Rápidos
            </h3>
            <ul
              className="space-y-2"
              role="list"
              aria-labelledby="footer-nav-heading"
            >
              {navLinks.map(({ label, view }) => (
                <li key={view}>
                  <button
                    onClick={() => onNavigate(view)}
                    className="text-[#A0AEC0] hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E3A5F] rounded px-1 py-0.5 -ml-1"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h3
              id="footer-contact-heading"
              className="text-lg font-semibold mb-4"
            >
              Contacto
            </h3>
            <ul
              className="space-y-3"
              role="list"
              aria-labelledby="footer-contact-heading"
            >
              <li className="flex items-start gap-3 text-[#A0AEC0]">
                <Mail
                  size={18}
                  className="shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <a
                  href="mailto:contacto@skillbay.co"
                  className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E3A5F] rounded"
                >
                  contacto@skillbay.co
                </a>
              </li>
              <li className="flex items-start gap-3 text-[#A0AEC0]">
                <Phone
                  size={18}
                  className="shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <a
                  href="tel:+573001234567"
                  className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E3A5F] rounded"
                >
                  +57 300 123 4567
                </a>
              </li>
              <li className="flex items-start gap-3 text-[#A0AEC0]">
                <MapPin
                  size={18}
                  className="shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>Colombia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="mt-12 pt-8 border-t border-[#2B6CB0]/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#A0AEC0] text-sm">
              &copy; {currentYear} SkillBay. Todos los derechos reservados.
            </p>
            <p className="text-[#A0AEC0] text-xs">
              Hecho con ❤️ para la comunidad colombiana
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
