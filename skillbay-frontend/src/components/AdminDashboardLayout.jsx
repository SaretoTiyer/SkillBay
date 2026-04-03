import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  FolderTree,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { API_URL } from "../config/api";
import logoFull from "../assets/IconoSkillBay.png";

export default function AdminDashboardLayout({
  children,
  currentView,
  onNavigate,
  onLogout,
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = useMemo(
    () => [
      { name: "Resumen", view: "admin_overview", icon: LayoutDashboard },
      { name: "Gestion Usuarios", view: "admin_users", icon: UserCog },
      { name: "Gestion Planes", view: "admin_plans", icon: ShieldCheck },
      { name: "Gestion Servicios", view: "admin_services", icon: Briefcase },
      { name: "Gestion Reportes", view: "admin_reports", icon: ShieldAlert },
      { name: "Gestion Categorias", view: "admin_categories", icon: FolderTree },
      { name: "Notificaciones", view: "admin_notifications", icon: Bell },
    ],
    []
  );

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/notificaciones/resumen?scope=all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setUnreadCount(Number(data?.unread_total || 0));
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 h-16 px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <img src={logoFull} alt="SkillBay" className="h-9" />
          <span className="text-sm font-semibold text-slate-700 hidden sm:inline">Panel Admin</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("admin_notifications")}
            className={`relative p-2 rounded-lg transition-colors ${
              currentView === "admin_notifications"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-xs bg-red-600 text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 bg-slate-900 text-slate-100 p-4 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64 translate-x-0" : "w-16 -translate-x-full lg:w-20 lg:translate-x-0"
        }`}
      >
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
                {!sidebarOpen && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap z-50">
                    {item.name}
                  </span>
                )}
                {item.view === "admin_notifications" && unreadCount > 0 && sidebarOpen && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-5 text-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        }`}
      >
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
