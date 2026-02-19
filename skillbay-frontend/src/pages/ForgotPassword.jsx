import { useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";
import logoFull from "../assets/IconoSkillBay.png";

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loadingCode, setLoadingCode] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    setLoadingCode(true);
    try {
      const response = await fetch(`${API_URL}/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo enviar el codigo.");
      Swal.fire("Listo", data.message, "success");
      setStep(2);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoadingCode(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoadingReset(true);
    try {
      const response = await fetch(`${API_URL}/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, codigo, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo restablecer.");
      Swal.fire("Listo", data.message, "success");
      onNavigate("login");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1E3A5F] via-[#2B6CB0] to-[#1E3A5F] py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img src={logoFull} alt="SkillBay" className="h-14" />
        </div>
        <h1 className="text-xl font-bold text-[#1E3A5F] mb-2">Recuperar contraseña</h1>
        <p className="text-sm text-slate-500 mb-6">Recibe un codigo en tu correo y crea una nueva Contraseña.</p>

        {step === 1 && (
          <form onSubmit={requestCode} className="space-y-4">
            <input
              type="email"
              className="w-full border border-slate-200 rounded px-3 py-2"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loadingCode} className="w-full py-2 rounded bg-blue-600 text-white disabled:opacity-60">
              {loadingCode ? "Enviando..." : "Enviar codigo"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <input
              type="text"
              className="w-full border border-slate-200 rounded px-3 py-2"
              placeholder="Codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full border border-slate-200 rounded px-3 py-2"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loadingReset} className="w-full py-2 rounded bg-emerald-600 text-white disabled:opacity-60">
              {loadingReset ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </form>
        )}

        <button onClick={() => onNavigate("login")} className="w-full mt-4 text-sm text-blue-600">
          Volver a iniciar sesion
        </button>
      </div>
    </div>
  );
}
