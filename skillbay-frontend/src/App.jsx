import { useState } from "react";

// 🔹 Componentes principales
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 🔹 Páginas públicas
import Home from "./pages/Home";
// import About from "./pages/About";
// import Services from "./pages/Services";
// import Contact from "./pages/Contact";
// import Login from "./pages/Login";
// import Register from "./pages/Register";

// 🔹 Dashboard
// import DashboardLayout from "./components/dashboard/DashboardLayout";
// import ExploreOpportunities from "./components/dashboard/ExploreOpportunities";
// import UserProfile from "./components/dashboard/UserProfile";
// import UserServices from "./components/dashboard/UserServices";
// import Applications from "./components/dashboard/Applications";
// import Messages from "./components/dashboard/Messages";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ==============================
  // 🔹 Autenticación
  // ==============================
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView("explore");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("home");
  };

  // ==============================
  // 🔹 Render: Vistas del dashboard
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
      case "messages":
        return <Messages />;
      default:
        return <ExploreOpportunities />;
    }
  };

  // ==============================
  // 🔹 Render: Vistas públicas
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
  // 🔹 Si el usuario está autenticado → Dashboard
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
  // 🔹 Si NO está autenticado → Sitio público
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
      {showNavAndFooter && <Footer />}
    </div>
  );
}

export default App;
