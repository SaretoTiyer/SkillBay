import { useEffect, useState } from "react";
import { CheckCircle, Loader2, ArrowRight, Home } from "lucide-react";
import { API_URL } from "../config/api";

/**
 * PaymentSuccess - Vista de retorno cuando MercadoPago aprueba el pago.
 * Se accede desde: /payment/success?ref=REF&payment_id=ID&status=approved
 */
export default function PaymentSuccess({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [pagoInfo, setPagoInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || params.get("external_reference");
    const paymentId = params.get("payment_id") || params.get("collection_id");
    const status = params.get("status") || params.get("collection_status");

    if (!ref) {
      setLoading(false);
      return;
    }

    // Notificar al backend del retorno exitoso
    fetch(`${API_URL}/mp/success?ref=${ref}&payment_id=${paymentId || ""}&status=${status || "approved"}`)
      .then((r) => r.json())
      .then((data) => {
        setPagoInfo(data);
        // Actualizar el usuario en localStorage si el plan cambió
        if (data?.success) {
          const token = localStorage.getItem("access_token");
          if (token) {
            fetch(`${API_URL}/user`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            })
              .then((r) => r.json())
              .then((userData) => {
                if (userData?.usuario) {
                  localStorage.setItem("usuario", JSON.stringify(userData.usuario));
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.error("Error al confirmar pago:", err);
        setError("No se pudo confirmar el estado del pago.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
          <p className="text-slate-600 font-medium">Confirmando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Ícono de éxito */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-emerald-600" size={48} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">¡Pago Aprobado!</h1>
        <p className="text-slate-500 mb-6">
          Tu plan ha sido activado exitosamente. Ya puedes disfrutar de todos los beneficios.
        </p>

        {pagoInfo?.plan && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-700 font-medium">Plan activado</p>
            <p className="text-xl font-bold text-emerald-800">{pagoInfo.plan}</p>
          </div>
        )}

        {pagoInfo?.referencia && (
          <div className="bg-slate-50 rounded-xl p-3 mb-6">
            <p className="text-xs text-slate-500">Referencia de pago</p>
            <p className="text-sm font-mono font-semibold text-slate-700">{pagoInfo.referencia}</p>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate("plans");
              } else {
                window.location.href = "/";
              }
            }}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Ver mis planes
            <ArrowRight size={18} />
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
