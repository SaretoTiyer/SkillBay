import { useState, useEffect } from "react";

// 🔹 Componentes principales
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 🔹 Páginas públicas
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

// 🔹 Dashboard
import DashboardLayout from "./components/DashboardLayout";
import ExploreOpportunities from "./dashboard-users/ExploreOpportunities";
import UserProfile from "./dashboard-users/UserProfile";
import UserServices from "./dashboard-users/UserServices";
import Applications from "./dashboard-users/Applications";
// import Messages from "./components/dashboard/Messages";

function App() {
  /* 
    INICIALIZACIÓN DE ESTADO 
    Intentamos leer de localStorage para mantener la sesión y la vista 
    incluso si se refresca la página.
  */
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem("currentView") || "home";
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verificamos si existe el token y el objeto usuario
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("usuario");
    return !!(token && user);
  });

  /* 
    EFECTO DE PERSISTENCIA
    Cada vez que cambie la vista, la guardamos.
  */
  useEffect(() => {
    localStorage.setItem("currentView", currentView);
  }, [currentView]);

  // ==============================
  //  Autenticación
  // ==============================
  const handleLogin = (data) => {
    // Guardamos en storage (aunque Login.jsx ya lo hace, es buena práctica sincronizar estado aquí)
    // Nota: Login.jsx setea localStorage. 'data' puede ser opcional si ya está en storage.
    setIsAuthenticated(true);
    setCurrentView("explore");
    // "explore" es la vista por defecto tras login, PERO
    // si quisiéramos mantener la vista anterior, podríamos no sobreescribirla.
    // El requerimiento dice: "cada vez que actualizo ... quiero que este se quede en la pagina que este"
    // Al hacer login, es normal ir al dashboard. Al refrescar, el useState inicial se encarga.
  };

  const handleLogout = () => {
    // Limpieza total
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("currentView");

    setIsAuthenticated(false);
    setCurrentView("home");
  };

  // ==============================
  //  Render: Vistas del dashboard
  // ==============================
  const renderDashboardView = () => {
    switch (currentView) {
      case "explore":
        return <ExploreOpportunities />;
      case "profile":
        return <UserProfile />;
      case "services":
        return <UserServices />;
      case "applications":
        return <Applications />;
      // case "messages":
      //   return <Messages />;
      default:
        return <ExploreOpportunities />;
    }
  };

  // ==============================
  //  Render: Vistas públicas
  // ==============================
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
      case "register":
        return <Register onNavigate={setCurrentView} />;
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  // ==============================
  // Si el usuario está autenticado → Dashboard
  // ==============================
  if (isAuthenticated) {
    return (
      <DashboardLayout
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      >
        {renderDashboardView()}
      </DashboardLayout>
    );
  }

  // ==============================
  //  Si NO está autenticado → Sitio público
  // ==============================
  const showNavAndFooter =
    currentView !== "login" && currentView !== "register";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar (solo si no está en login/register) */}
      {showNavAndFooter && (
        <Navbar currentView={currentView} onNavigate={setCurrentView} />
      )}

      {/* Contenido principal */}
      <main className="grow">{renderPublicView()}</main>

      {/* Footer (solo si no está en login/register) */}
      {showNavAndFooter && <Footer onNavigate={setCurrentView} />}
    </div>
  );
}

export default App;
