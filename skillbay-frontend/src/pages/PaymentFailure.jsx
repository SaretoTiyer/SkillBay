import { useEffect } from "react";
import { XCircle, RefreshCw, Home } from "lucide-react";
import { API_URL } from "../config/api";

/**
 * PaymentFailure - Vista de retorno cuando MercadoPago rechaza el pago.
 * Se accede desde: /payment/failure?ref=REF&status=rejected
 */
export default function PaymentFailure({ onNavigate }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || params.get("external_reference");
    const status = params.get("status");

    if (ref) {
      // Notificar al backend del rechazo
      fetch(`${API_URL}/mp/failure?ref=${ref}&status=${status || "rejected"}`)
        .catch((err) => console.error("Error al notificar rechazo:", err));
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Ícono de error */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-500" size={48} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Pago Rechazado</h1>
        <p className="text-slate-500 mb-6">
          Tu pago no pudo ser procesado. Esto puede deberse a fondos insuficientes, datos incorrectos
          o una restricción de tu banco.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700">
            No se realizó ningún cargo a tu cuenta. Puedes intentarlo nuevamente con otro método de pago.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate("plans");
              } else {
                window.location.href = "/";
              }
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <RefreshCw size={18} />
            Intentar nuevamente
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
