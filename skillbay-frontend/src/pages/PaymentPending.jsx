import { useEffect, useState } from "react";
import { Clock, RefreshCw, Home, Bell } from "lucide-react";
import { API_URL } from "../config/api";

/**
 * PaymentPending - Vista de retorno cuando el pago está en proceso.
 * Se accede desde: /payment/pending?ref=REF
 */
export default function PaymentPending({ onNavigate }) {
  const [referencia, setReferencia] = useState(null);
  const [checking, setChecking] = useState(false);
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || params.get("external_reference");
    setReferencia(ref);

    if (ref) {
      fetch(`${API_URL}/mp/pending?ref=${ref}`)
        .catch((err) => console.error("Error al notificar pendiente:", err));
    }
  }, []);

  const verificarEstado = async () => {
    if (!referencia) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setChecking(true);
    try {
      const response = await fetch(`${API_URL}/mp/estado/${referencia}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await response.json();
      setEstado(data);

      if (data?.estado === "Completado" || data?.mp_status === "approved") {
        // Actualizar usuario en localStorage
        const userRes = await fetch(`${API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const userData = await userRes.json();
        if (userData?.usuario) {
          localStorage.setItem("usuario", JSON.stringify(userData.usuario));
        }
      }
    } catch (err) {
      console.error("Error al verificar estado:", err);
    } finally {
      setChecking(false);
    }
  };

  const estaAprobado = estado?.estado === "Completado" || estado?.mp_status === "approved";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Ícono de pendiente */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          {estaAprobado ? (
            <Bell className="text-emerald-500" size={48} />
          ) : (
            <Clock className="text-amber-500" size={48} />
          )}
        </div>

        {estaAprobado ? (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">¡Pago Confirmado!</h1>
            <p className="text-slate-500 mb-6">
              Tu pago fue aprobado. El plan <strong>{estado?.plan}</strong> ya está activo.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Pago en Proceso</h1>
            <p className="text-slate-500 mb-6">
              Tu pago está siendo procesado. Esto puede tomar unos minutos. Te notificaremos
              por correo cuando sea confirmado.
            </p>
          </>
        )}

        {referencia && (
          <div className="bg-slate-50 rounded-xl p-3 mb-6">
            <p className="text-xs text-slate-500">Referencia de pago</p>
            <p className="text-sm font-mono font-semibold text-slate-700">{referencia}</p>
          </div>
        )}

        {estado && !estaAprobado && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
            <p className="text-sm text-amber-700">
              Estado actual: <strong>{estado.estado}</strong>
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {!estaAprobado && (
            <button
              onClick={verificarEstado}
              disabled={checking}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {checking ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Verificar estado
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate(estaAprobado ? "plans" : "payments");
              } else {
                window.location.href = "/";
              }
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {estaAprobado ? "Ver mis planes" : "Ir a pagos"}
          </button>

          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate("explore");
              } else {
                window.location.href = "/";
              }
            }}
            className="flex items-center justify-center gap-2 text-slate-600 hover:text-slate-800 font-medium py-2 transition-colors"
          >
            <Home size={16} />
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
