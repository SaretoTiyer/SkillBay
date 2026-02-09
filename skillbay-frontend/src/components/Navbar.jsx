import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoFull from "../assets/IconoSkillBayLight.png"; 

const Navbar = ({ currentView, onNavigate }) => {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
    const handleScroll = () => {
    setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
}, []);

const leftNavItems = [
    { name: "Inicio", view: "home" },
    { name: "Servicios", view: "services" },
    { name: "Sobre Nosotros", view: "about" },
];

const rightNavItems = [{ name: "Contacto", view: "contact" }];

return (
    <nav
    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
        ? "bg-[#1E3A5F]/95 backdrop-blur-lg shadow-2xl"
        : "bg-linear-to-r from-[#1E3A5F] via-[#1a4470] to-[#1E3A5F] shadow-xl"
    }`}
    >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
        {/* Left Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-8 flex-1">
            {leftNavItems.map((item) => (
            <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`cursor-pointer relative px-1 py-2 transition-all duration-300 group ${
                currentView === item.view
                    ? "text-white"
                    : "text-[#A0AEC0] hover:text-white"
                }`}
            >
                <span className="relative z-10">{item.name}</span>
                <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-[#2B6CB0] to-[#4299e1] transition-all duration-300 ${
                    currentView === item.view
                    ? "scale-x-100 opacity-100"
                    : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                }`}
                ></span>
                {currentView === item.view && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B6CB0] blur-sm"></span>
                )}
            </button>
            ))}
        </div>

        {/* Logo Central */}
        <div
            className="cursor-pointer transform transition-all duration-300 hover:scale-110"
            onClick={() => onNavigate("home")}
        >
            <img
            src={logoFull}
            alt="SkillBay"
            className={`transition-all duration-300 ${
                scrolled ? "h-12" : "h-14"
            }`}
            />
        </div>

        {/* Right Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
            {rightNavItems.map((item) => (
            <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`cursor-pointer relative px-1 py-2 transition-all duration-300 group ${
                currentView === item.view
                    ? "text-white"
                    : "text-[#A0AEC0] hover:text-white"
                }`}
            >
                <span className="relative z-10">{item.name}</span>
                <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-[#2B6CB0] to-[#4299e1] transition-all duration-300 ${
                    currentView === item.view
                    ? "scale-x-100 opacity-100"
                    : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                }`}
                ></span>
                {currentView === item.view && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B6CB0] blur-sm"></span>
                )}
            </button>
            ))}

            {/* Botones CTA */}
            <div className="flex items-center gap-3">
            <button
                onClick={() => onNavigate("register")}
                className="cursor-pointer relative group px-5 py-2.5 bg-white text-[#1E3A5F] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-white/30 hover:scale-105 border border-white/20"
            >
                <span className="relative z-10">Registrarse</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#2B6CB0]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>

            <button
                onClick={() => onNavigate("login")}
                className="cursor-pointer relative group px-5 py-2.5 bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] text-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#2B6CB0]/50 hover:scale-105"
            >
                <span className="relative z-10">Iniciar Sesión</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
            </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
            <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
        </div>
    </div>

    {/* Mobile Navigation */}
    <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
        mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
    >
        <div className="bg-[#1E3A5F]/98 backdrop-blur-lg border-t border-white/10">
        <div className="px-4 py-6 space-y-2">
            {[...leftNavItems, ...rightNavItems].map((item) => (
            <button
                key={item.view}
                onClick={() => {
                onNavigate(item.view);
                setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-5 py-3.5 rounded-xl transition-all duration-300 ${
                currentView === item.view
                    ? "bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] text-white shadow-lg shadow-[#2B6CB0]/30 transform scale-[1.02]"
                    : "text-[#A0AEC0] hover:text-white hover:bg-white/5"
                }`}
            >
                <div className="flex items-center justify-between">
                <span>{item.name}</span>
                {currentView === item.view && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
                </div>
            </button>
            ))}

            <div className="h-px bg-white/10 my-4"></div>

            <button
            onClick={() => {
                onNavigate("register");
                setMobileMenuOpen(false);
            }}
            className="block w-full px-5 py-4 bg-white text-[#1E3A5F] rounded-xl hover:shadow-lg transition-all duration-300 text-center mb-3"
            >
            Registrarse
            </button>
            <button
            onClick={() => {
                onNavigate("login");
                setMobileMenuOpen(false);
            }}
            className="block w-full px-5 py-4 bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] text-white rounded-xl hover:shadow-lg hover:shadow-[#2B6CB0]/30 transition-all duration-300 text-center"
            >
            Iniciar Sesión
            </button>
        </div>
        </div>
    </div>

    {/* Línea decorativa inferior */}
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#2B6CB0]/50 to-transparent"></div>
    </nav>
);
};

export default Navbar;
