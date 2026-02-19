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
} from "lucide-react";
import { API_URL } from "../config/api";
import logoFull from "../assets/IconoSkillBay.png";
import NotificationCenter from "./NotificationCenter";

export default function AdminDashboardLayout({
  children,
  currentView,
  onNavigate,
  onLogout,
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = useMemo(
    () => [
      { name: "Resumen", view: "admin_overview", icon: LayoutDashboard },
      { name: "Gestion Users", view: "admin_users", icon: UserCog },
      { name: "Gestion Planes", view: "admin_plans", icon: ShieldCheck },
      { name: "Gestion Postulaciones", view: "admin_applications", icon: BarChart3 },
      { name: "Gestion Reportes", view: "admin_reports", icon: ShieldAlert },
      { name: "Gestion Categorias", view: "admin_categories", icon: FolderTree },
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
          <img src={logoFull} alt="SkillBay" className="h-8" />
          <span className="text-sm font-semibold text-slate-700">Panel Admin</span>
        </div>

        <div className="relative flex items-center gap-3">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-xs bg-red-600 text-white rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Salir</span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12">
              <NotificationCenter isAdmin onActionComplete={fetchNotifications} />
            </div>
          )}
        </div>
      </header>

      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-slate-900 text-slate-100 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                  active ? "bg-blue-600 text-white" : "hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="pt-16 pl-0 lg:pl-64">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
