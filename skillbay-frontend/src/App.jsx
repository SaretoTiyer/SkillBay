import { useEffect, useMemo, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboardLayout from "./components/AdminDashboardLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";

import ExploreOpportunities from "./dashboard-users/ExploreOpportunities";
import UserProfile from "./dashboard-users/UserProfile";
import UserServices from "./dashboard-users/UserServices";
import Applications from "./dashboard-users/Applications";
import PlanesUser from "./dashboard-users/PlanesUser/PlanesUser";
import UserMessages from "./dashboard-users/UserMessages";

import AdminOverview from "./dashboard-admin/AdminOverview";
import UserManagement from "./dashboard-admin/UserManagement";
import PlanManagement from "./dashboard-admin/PlanManagement";
import ApplicationManagement from "./dashboard-admin/ApplicationManagement";
import CategoryManagement from "./dashboard-admin/CategoryManagement";
import ReportManagement from "./dashboard-admin/ReportManagement";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const [currentView, setCurrentView] = useState(() => localStorage.getItem("currentView") || "home");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("usuario");
    return Boolean(token && user);
  });
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  useEffect(() => {
    localStorage.setItem("currentView", currentView);
  }, [currentView]);

  const isAdmin = useMemo(() => currentUser?.rol === "admin", [currentUser]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isAdmin && !String(currentView).startsWith("admin_")) {
      setCurrentView("admin_overview");
    }
    if (!isAdmin && String(currentView).startsWith("admin_")) {
      setCurrentView("explore");
    }
  }, [isAuthenticated, isAdmin, currentView]);

  const handleLogin = (data) => {
    const user = data?.usuario || getStoredUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView(user?.rol === "admin" ? "admin_overview" : "explore");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("currentView");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView("home");
  };

  const renderUserDashboardView = () => {
    switch (currentView) {
      case "explore":
        return <ExploreOpportunities />;
      case "profile":
        return <UserProfile />;
      case "services":
        return <UserServices />;
      case "applications":
        return <Applications />;
      case "messages":
        return <UserMessages />;
      case "plans":
        return <PlanesUser />;
      default:
        return <ExploreOpportunities />;
    }
  };

  const renderAdminDashboardView = () => {
    switch (currentView) {
      case "admin_overview":
        return <AdminOverview />;
      case "admin_users":
        return <UserManagement />;
      case "admin_plans":
        return <PlanManagement />;
      case "admin_applications":
        return <ApplicationManagement />;
      case "admin_reports":
        return <ReportManagement />;
      case "admin_categories":
        return <CategoryManagement />;
      default:
        return <AdminOverview />;
    }
  };

  const renderPublicView = () => {
    switch (currentView) {
      case "home":
        return <Home onNavigate={setCurrentView} />;
      case "about":
        return <About />;
      case "services":
        return <Services onNavigate={setCurrentView} />;
      case "contact":
        return <Contact />;
      case "login":
        return <Login onNavigate={setCurrentView} onLogin={handleLogin} />;
      case "forgot_password":
        return <ForgotPassword onNavigate={setCurrentView} />;
      case "register":
        return <Register onNavigate={setCurrentView} />;
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  if (isAuthenticated && isAdmin) {
    return (
      <AdminDashboardLayout currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout}>
        {renderAdminDashboardView()}
      </AdminDashboardLayout>
    );
  }

  if (isAuthenticated) {
    return (
      <DashboardLayout currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout}>
        {renderUserDashboardView()}
      </DashboardLayout>
    );
  }

  const showNavAndFooter = currentView !== "login" && currentView !== "register";

  return (
    <div className="min-h-screen flex flex-col">
      {showNavAndFooter && <Navbar currentView={currentView} onNavigate={setCurrentView} />}
      <main className="grow">{renderPublicView()}</main>
      {showNavAndFooter && <Footer onNavigate={setCurrentView} />}
    </div>
  );
}

export default App;
