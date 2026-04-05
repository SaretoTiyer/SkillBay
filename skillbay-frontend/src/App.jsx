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
import TermsAndConditions from "./pages/TermsAndConditions";
import Invoice from "./pages/Invoice";

import ExploreOpportunities from "./dashboard-users/ExploreOpportunities";
import ExploreServices from "./dashboard-users/ExploreServices";
import UserProfile from "./dashboard-users/UserProfile";
import UserServices from "./dashboard-users/UserServices";
import UserPayments from "./dashboard-users/PlanesUser/UserPayments";
import Applications from "./dashboard-users/MyApplications/MyApplications";
import NotificationsPage from "./dashboard-users/Notifications/NotificationsPage";
import PlanesUser from "./dashboard-users/PlanesUser/PlanesUser";
import Checkout from "./dashboard-users/Checkout/Checkout";
import UserMessages from "./dashboard-users/UserMessages";
import UserPublicProfile from "./dashboard-users/UserPublicProfile";
import UserConfig from "./dashboard-users/UserConfig/UserConfig";

import AdminOverview from "./dashboard-admin/AdminOverview";
import UserManagement from "./dashboard-admin/users/UserTable";
import PlanManagement from "./dashboard-admin/plans/PlanTable";
import ServiceManagement from "./dashboard-admin/services/ServiceTable";
import CategoryManagement from "./dashboard-admin/CategoryManagement";
import ReportManagement from "./dashboard-admin/ReportManagement";
import AdminNotifications from "./dashboard-admin/AdminNotifications";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Detecta si la URL actual corresponde a la página de términos y condiciones
 */
function detectTermsView() {
  if (window.location.pathname === '/terminos-y-condiciones') return 'terms';
  return null;
}

/**
 * Detecta si la URL actual corresponde a la página de factura
 */
function detectInvoiceView() {
  if (window.location.pathname === '/invoice') return 'invoice';
  return null;
}

function App() {
  const termsView = detectTermsView();
  const invoiceView = detectInvoiceView();
  const [currentView, setCurrentView] = useState(
    () => invoiceView || termsView || localStorage.getItem("currentView") || "home"
  );
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
    if (window.location.hash === "#checkout") {
      window.location.hash = "";
      const checkoutData = localStorage.getItem("checkout_data");
      if (checkoutData && isAuthenticated) {
        setCurrentView("checkout");
      }
    }
  }, [isAuthenticated]);

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
    localStorage.removeItem("checkout_data");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView("home");
  };

  const getCheckoutData = () => {
    try {
      const data = localStorage.getItem("checkout_data");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  // eslint-disable-next-line no-unused-vars
  const startCheckout = (tipo, idItem, monto, descripcion) => {
    localStorage.setItem("checkout_data", JSON.stringify({
      tipo,
      idItem,
      monto,
      descripcion,
    }));
    setCurrentView("checkout");
  };

  const clearCheckoutData = () => {
    localStorage.removeItem("checkout_data");
  };

  const renderUserDashboardView = () => {
    switch (currentView) {
      case "explore":
        return <ExploreOpportunities />;
      case "explore_services":
        return <ExploreServices />;
      case "profile":
        return <UserProfile />;
      case "services":
        return <UserServices />;
      case "payments":
        return <UserPayments />;
      case "applications":
        return <Applications />;
      case "notifications":
        return <NotificationsPage />;
      case "messages":
        return <UserMessages />;
      case "public_profile":
        return <UserPublicProfile onBack={() => setCurrentView("explore")} />;
      case "config":
        return <UserConfig />;
      case "plans":
        return <PlanesUser onNavigate={setCurrentView} />;
      case "checkout": {
        const checkoutData = getCheckoutData();
        if (!checkoutData) {
          return <ExploreOpportunities />;
        }
        return (
          <Checkout
            tipo={checkoutData.tipo}
            idItem={checkoutData.idItem}
            monto={checkoutData.monto}
            descripcion={checkoutData.descripcion}
            onNavigate={(view) => {
              clearCheckoutData();
              setCurrentView(view);
            }}
            onComplete={() => {
              clearCheckoutData();
              setCurrentView("profile");
            }}
          />
        );
      }
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
      case "admin_services":
        return <ServiceManagement />;
      case "admin_reports":
        return <ReportManagement />;
      case "admin_categories":
        return <CategoryManagement />;
      case "admin_notifications":
        return <AdminNotifications />;
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
         case "terms":
           return <TermsAndConditions onNavigate={setCurrentView} />;
        default:
         return <Home onNavigate={setCurrentView} />;
     }
   };

  if (currentView === "invoice") {
    return <Invoice />;
  }

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

  const showNavAndFooter = currentView !== "login" && currentView !== "register" && currentView !== "terms";

  return (
    <div className="min-h-screen flex flex-col">
      {showNavAndFooter && <Navbar currentView={currentView} onNavigate={setCurrentView} />}
      <main className="grow">{renderPublicView()}</main>
      {showNavAndFooter && <Footer onNavigate={setCurrentView} />}
    </div>
  );
}

export default App;
