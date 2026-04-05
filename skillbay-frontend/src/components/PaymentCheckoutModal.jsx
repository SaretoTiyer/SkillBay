import { useState } from "react";
import {
  CreditCard, Smartphone, QrCode, Banknote, Loader2, X,
  Shield, ArrowLeft, CheckCircle
} from "lucide-react";
import { showSuccess, showError } from "../utils/swalHelpers";
import { API_URL } from "../config/api";

const METODOS_PAGO = [
  { id: "tarjeta", nombre: "Tarjeta", desc: "Crédito o débito", icono: CreditCard, color: "blue" },
  { id: "nequi", nombre: "Nequi", desc: "Transferencia móvil", icono: Smartphone, color: "purple" },
  { id: "bancolombia_qr", nombre: "QR Bancolombia", desc: "Escanea y paga", icono: QrCode, color: "yellow" },
  { id: "efectivo", nombre: "Efectivo", desc: "Pago en persona", icono: Banknote, color: "green" },
];

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-700", ring: "ring-blue-500" },
  purple: { bg: "bg-purple-50", border: "border-purple-500", text: "text-purple-700", ring: "ring-purple-500" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-700", ring: "ring-yellow-500" },
  green: { bg: "bg-green-50", border: "border-green-500", text: "text-green-700", ring: "ring-green-500" },
};

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  service,
  postulacionId,
  monto,
  authHeaders,
  onPaymentSuccess,
}) {
  const [paso, setPaso] = useState("metodo"); // metodo | tarjeta | procesando | exito
  const [metodoSeleccionado, setMetodoSeleccionado] = useState("tarjeta");
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero_tarjeta: "",
    titular: "",
    fecha_vencimiento: "",
    cvv: "",
  });
  const [processing, setProcessing] = useState(false);
  const [pagoId, setPagoId] = useState(null);

  // Filtrar métodos de pago según los configurados en el servicio
  const metodosDisponibles = service?.metodos_pago && service.metodos_pago.length > 0
    ? METODOS_PAGO.filter(m => service.metodos_pago.includes(m.id))
    : METODOS_PAGO;

  // Si el método seleccionado no está disponible, usar el primero disponible
  const metodoValido = metodosDisponibles.some(m => m.id === metodoSeleccionado)
    ? metodoSeleccionado
    : metodosDisponibles[0]?.id || "tarjeta";

  if (!isOpen) return null;

  const handleIniciarPago = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/pagos/servicio/simulado-postulacion`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          id_postulacion: postulacionId,
          metodo: metodoValido,
          modalidad_servicio: service?.modo_trabajo || "virtual",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "No se pudo iniciar el pago.");

      setPagoId(data.data.id_pago);

      if (metodoValido === "tarjeta") {
        setPaso("tarjeta");
      } else {
        await procesarPago(data.data.id_pago, {});
      }
    } catch (error) {
      showError("Error", error.message || "No se pudo iniciar el pago.");
    } finally {
      setProcessing(false);
    }
  };

  const procesarPago = async (idPagoOverride, datosExtra) => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/pagos/procesar`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          id_pago: idPagoOverride || pagoId,
          tipo: "servicio",
          datos_pago: datosExtra,
        }),
      });
      const data = await response.json();
      if (data?.success) {
        setPaso("exito");
        onPaymentSuccess?.();
      } else {
        showError("Pago rechazado", data?.data?.mensaje || "Intenta con otro método.");
        setPaso("metodo");
      }
    } catch (error) {
      showError("Error", error.message || "No se pudo procesar el pago.");
      setPaso("metodo");
    } finally {
      setProcessing(false);
    }
  };

  const handlePagarTarjeta = async (e) => {
    e.preventDefault();
    await procesarPago(pagoId, {
      numero_tarjeta: datosTarjeta.numero_tarjeta,
      titular: datosTarjeta.titular,
      fecha_vencimiento: datosTarjeta.fecha_vencimiento,
      cvv: datosTarjeta.cvv,
    });
  };

  const handleClose = () => {
    setPaso("metodo");
    setMetodoSeleccionado(metodosDisponibles[0]?.id || "tarjeta");
    setDatosTarjeta({ numero_tarjeta: "", titular: "", fecha_vencimiento: "", cvv: "" });
    setPagoId(null);
    onClose();
  };

  const metodoObj = METODOS_PAGO.find(m => m.id === metodoValido);
  const MetodoIcon = metodoObj?.icono || CreditCard;
  const colors = COLOR_MAP[metodoObj?.color || "blue"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-lg sm:rounded-2xl bg-white shadow-2xl flex flex-col sm:max-h-[90vh] max-h-[95dvh] overflow-hidden">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <button onClick={handleClose}
          className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-full"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col overflow-y-auto overscroll-contain">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 pb-4 text-white">
            <p className="text-blue-100 text-xs font-medium mb-1">Pago al proveedor</p>
            <h2 className="text-lg font-bold leading-tight">{service?.titulo || "Servicio"}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {service?.categoria?.nombre || "General"}
            </p>
          </div>

          <div className="p-5">
            {/* Price */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Total a pagar</p>
                <p className="text-2xl font-bold text-blue-800">
                  ${Number(monto || 0).toLocaleString("es-CO")} COP
                </p>
              </div>
              <Shield size={28} className="text-blue-300" />
            </div>

            {/* Step: Method Selection */}
            {paso === "metodo" && (
              <>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Selecciona un método de pago</h3>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {metodosDisponibles.map((m) => {
                    const Icon = m.icono;
                    const c = COLOR_MAP[m.color];
                    return (
                      <button key={m.id} type="button"
                        onClick={() => setMetodoSeleccionado(m.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          metodoSeleccionado === m.id ? `${c.border} ${c.bg}` : "border-slate-200 hover:border-slate-300"
                        }`}
                        aria-pressed={metodoSeleccionado === m.id}
                      >
                        <Icon size={18} className={metodoSeleccionado === m.id ? c.text : "text-slate-400"} />
                        <div>
                          <span className="text-sm font-medium text-slate-700 block">{m.nombre}</span>
                          <span className="text-xs text-slate-400">{m.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button onClick={handleIniciarPago} disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 text-sm"
                >
                  {processing ? (<><Loader2 className="animate-spin" size={18} /> Iniciando pago...</>) : (<><MetodoIcon size={18} /> Continuar con {metodoObj?.nombre}</>)}
                </button>
              </>
            )}

            {/* Step: Card Form */}
            {paso === "tarjeta" && (
              <form onSubmit={handlePagarTarjeta}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <CreditCard size={16} className="text-blue-600" /> Datos de la tarjeta
                  </h3>
                  <button type="button" onClick={() => setPaso("metodo")}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Volver
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="checkout-card-number" className="block text-sm font-medium text-slate-700 mb-1">Número de tarjeta</label>
                    <input id="checkout-card-number" type="text" inputMode="numeric" autoComplete="cc-number"
                      value={datosTarjeta.numero_tarjeta}
                      onChange={(e) => setDatosTarjeta(prev => ({ ...prev, numero_tarjeta: e.target.value.replace(/\D/g, "").slice(0, 16) }))}
                      placeholder="4242 4242 4242 4242"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1">Usa 4000, 5000 o 6000 para simular rechazo</p>
                  </div>
                  <div>
                    <label htmlFor="checkout-card-name" className="block text-sm font-medium text-slate-700 mb-1">Titular</label>
                    <input id="checkout-card-name" type="text" autoComplete="cc-name"
                      value={datosTarjeta.titular}
                      onChange={(e) => setDatosTarjeta(prev => ({ ...prev, titular: e.target.value }))}
                      placeholder="Nombre completo"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="checkout-card-expiry" className="block text-sm font-medium text-slate-700 mb-1">Vencimiento</label>
                      <input id="checkout-card-expiry" type="text" inputMode="numeric" autoComplete="cc-exp"
                        value={datosTarjeta.fecha_vencimiento}
                        onChange={(e) => setDatosTarjeta(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                        placeholder="MM/AA"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-card-cvv" className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                      <input id="checkout-card-cvv" type="text" inputMode="numeric" autoComplete="cc-csc"
                        value={datosTarjeta.cvv}
                        onChange={(e) => setDatosTarjeta(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        placeholder="123"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={processing}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 text-sm"
                >
                  {processing ? (<><Loader2 className="animate-spin" size={18} /> Procesando...</>) : (<><Shield size={16} /> Confirmar pago</>)}
                </button>
              </form>
            )}

            {/* Step: Success */}
            {paso === "exito" && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">¡Pago exitoso!</h3>
                <p className="text-sm text-slate-500 mb-6">El pago ha sido procesado correctamente.</p>
                <button onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-xl font-medium text-sm transition-all"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
