import { useEffect, useMemo, useState } from "react";
import { Bell, Briefcase, BriefcaseBusiness, ChevronDown, CreditCard, FileText, Home, LogOut, Menu, MessageSquare, User, X } from "lucide-react";
import logoFull from "../assets/IconoSkillBay.png";
import { API_URL } from "../config/api";
import NotificationCenter from "./NotificationCenter";

export default function DashboardLayout({ children, currentView, onNavigate, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "{}");
    } catch {
      return {};
    }
  }, []);

  const navItems = [
    { name: "Explorar Oportunidades", view: "explore", icon: Home },
    { name: "Explorar Services", view: "explore_services", icon: BriefcaseBusiness },
    { name: "Mi Perfil", view: "profile", icon: User },
    { name: "Mi Servicios", view: "services", icon: Briefcase },
    { name: "Postulaciones", view: "applications", icon: FileText },
    { name: "Mensajes", view: "messages", icon: MessageSquare },
    { name: "Planes", view: "plans", icon: CreditCard },
  ];

  useEffect(() => {
    fetchNotificationsSummary();
    const interval = setInterval(fetchNotificationsSummary, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationsSummary = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/notificaciones/resumen`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setUnreadCount(Number(data?.unread_total || 0));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const initials = `${currentUser?.nombre?.[0] || "U"}${currentUser?.apellido?.[0] || ""}`.toUpperCase();
  const fullName = `${currentUser?.nombre || "Usuario"} ${currentUser?.apellido || ""}`.trim();

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E2E8F0] via-[#f7fafc] to-[#E2E8F0]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 hover:bg-[#E2E8F0] rounded-lg text-[#1E3A5F]"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-[#E2E8F0] rounded-lg text-[#1E3A5F]"
            >
              <Menu size={24} />
            </button>
            <img src={logoFull} alt="SkillBay" className="h-8 lg:h-10" />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-[#E2E8F0] rounded-lg text-[#1E3A5F]"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-5 h-5 px-1 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 z-50">
                  <NotificationCenter onActionComplete={fetchNotificationsSummary} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 hover:bg-[#E2E8F0] rounded-lg">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2B6CB0] to-[#1E3A5F] flex items-center justify-center text-white text-sm">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm text-[#1E3A5F]">{fullName}</p>
              </div>
              <ChevronDown size={16} className="text-[#A0AEC0]" />
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`hidden lg:block fixed left-0 top-16 bottom-0 bg-linear-to-b from-[#1E3A5F] to-[#163050] text-white transition-all duration-300 shadow-2xl z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                  currentView === item.view ? "bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] shadow-lg" : "hover:bg-white/10"
                }`}
              >
                <Icon size={22} className="shrink-0" />
                {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/20">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-500/20 text-red-300"
            >
              <LogOut size={22} className="shrink-0" />
              {sidebarOpen && <span className="text-sm">Cerrar Sesion</span>}
            </button>
          </div>
        </nav>
      </aside>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed left-0 top-16 bottom-0 w-72 bg-linear-to-b from-[#1E3A5F] to-[#163050] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      onNavigate(item.view);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                      currentView === item.view ? "bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] shadow-lg" : "hover:bg-white/10"
                    }`}
                  >
                    <Icon size={22} />
                    <span className="text-sm">{item.name}</span>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-white/20">
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-500/20 text-red-300"
                >
                  <LogOut size={22} />
                  <span className="text-sm">Cerrar Sesion</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-20"}`}>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
