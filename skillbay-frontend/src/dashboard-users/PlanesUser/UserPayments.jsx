import { useEffect, useMemo, useState } from "react";
import {
  CreditCard, Loader2, ReceiptText, CheckCircle, Clock, Shield,
  Wallet, Smartphone, Banknote, QrCode, ChevronDown, ChevronUp,
  ArrowLeft, AlertCircle, X
} from "lucide-react";
import Swal from "sweetalert2";
import { showSuccess, showError, showInfo } from "../../utils/swalHelpers";
import { API_URL } from "../../config/api";
import RatingModal from "../../components/RatingModal";
import { determinarContextoCalificacion } from "../../utils/ratingContext";

const METODOS_PAGO = [
  { id: "tarjeta", nombre: "Tarjeta", desc: "Crédito o débito", icono: CreditCard, color: "blue" },
  { id: "nequi", nombre: "Nequi", desc: "Transferencia móvil", icono: Smartphone, color: "purple" },
  { id: "bancolombia_qr", nombre: "QR Bancolombia", desc: "Escanea y paga", icono: QrCode, color: "yellow" },
  { id: "efectivo", nombre: "Efectivo", desc: "Pago en persona", icono: Banknote, color: "green" },
];

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", ring: "ring-blue-500", badge: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", ring: "ring-purple-500", badge: "bg-purple-100 text-purple-700" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", ring: "ring-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", ring: "ring-green-500", badge: "bg-green-100 text-green-700" },
};

const ESTADO_STYLES = {
  Completado: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pendiente: "bg-amber-50 text-amber-700 border border-amber-200",
  Rechazado: "bg-red-50 text-red-700 border border-red-200",
  Reembolsado: "bg-blue-50 text-blue-700 border border-blue-200",
};

// Skeleton component
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

function PaymentHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="w-16 h-4 ml-auto" />
            <Skeleton className="w-14 h-5 ml-auto rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-48 h-4" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="w-20 h-6 ml-auto" />
          <Skeleton className="w-12 h-3 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export default function UserPayments() {
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [history, setHistory] = useState({ pagos_plan: [], pagos_servicio: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");
  const [historySubTab, setHistorySubTab] = useState("planes");

  const [planForm, setPlanForm] = useState({ id_Plan: "", modalidadPago: "virtual" });
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [pasoPago, setPasoPago] = useState("seleccion");
  const [datosPago, setDatosPago] = useState({ numero_tarjeta: "", titular: "", fecha_vencimiento: "", cvv: "" });
  const [idPagoActual, setIdPagoActual] = useState(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingRatingService, setPendingRatingService] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Service checkout state
  const [serviceCheckout, setServiceCheckout] = useState(null);
  const [serviceMetodoPago, setServiceMetodoPago] = useState("tarjeta");
  const [servicePasoPago, setServicePasoPago] = useState("seleccion");
  const [serviceDatosPago, setServiceDatosPago] = useState({ numero_tarjeta: "", titular: "", fecha_vencimiento: "", cvv: "" });
  const [servicePagoId, setServicePagoId] = useState(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("usuario") || "{}"); } catch { return {}; }
  }, []);

  const currentPlanId = currentUser?.id_Plan || "";

  useEffect(() => { loadData(); }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/user`, { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        if (data.usuario) setCurrentUserEmail(data.usuario.id_CorreoUsuario);
      }
    } catch (err) { console.error("Error fetching current user:", err); }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, servicesRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/planes`, { headers: { Accept: "application/json" } }),
        fetch(`${API_URL}/servicios/explore`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}`, Accept: "application/json" } }),
        fetch(`${API_URL}/pagos/historial`, { headers: authHeaders() }),
        fetchCurrentUser(),
      ]);

      const plansData = await plansRes.json();
      const servicesData = servicesRes.ok ? await servicesRes.json() : [];
      const historyData = historyRes.ok ? await historyRes.json() : { pagos_plan: [], pagos_servicio: [] };

      const plansList = Array.isArray(plansData?.planes) ? plansData.planes : [];
      setPlans(plansList);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setHistory(historyData);
      setPlanForm((prev) => ({ ...prev, id_Plan: plansList.find((p) => p.id_Plan !== currentPlanId)?.id_Plan || plansList[0]?.id_Plan || "" }));
    } catch (error) {
      console.error("Error loading payments data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---- Plan payment ----
  const submitPlanPayment = async (e) => {
    e.preventDefault();
    if (!planForm.id_Plan) return;

    const plan = plans.find((p) => p.id_Plan === planForm.id_Plan);
    const precio = Number(plan?.precioMensual ?? 0);

    if (precio <= 0) {
      try {
        const response = await fetch(`${API_URL}/pagos/plan`, {
          method: "POST", headers: authHeaders(),
          body: JSON.stringify({ id_Plan: planForm.id_Plan, modalidadPago: "virtual" }),
        });
        const data = await response.json();
        if (!response.ok || !data?.success) throw new Error(data?.message || "No se pudo activar el plan.");
        const updatedUser = { ...currentUser, id_Plan: planForm.id_Plan };
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
        showSuccess("¡Plan activado!", `El plan ${plan?.nombre} ha sido activado exitosamente.`);
        await loadData();
      } catch (error) { showError("Error", error.message || "No se pudo activar el plan."); }
      return;
    }

    setProcessing(true);
    try {
      const initRes = await fetch(`${API_URL}/pagos/plan/simulado`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ id_plan: planForm.id_Plan, metodo: metodoPago }),
      });
      const initData = await initRes.json();
      if (!initRes.ok || !initData?.success) throw new Error(initData?.message || "No se pudo iniciar el pago.");

      const pagoId = initData.data.id_pago;
      setIdPagoActual(pagoId);

      if (metodoPago === "tarjeta") { setPasoPago("formulario"); setProcessing(false); return; }

      const procesarRes = await fetch(`${API_URL}/pagos/procesar`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ id_pago: pagoId, tipo: "plan", datos_pago: {} }),
      });
      const procesarData = await procesarRes.json();

      if (procesarData?.success) {
        const updatedUser = { ...currentUser, id_Plan: planForm.id_Plan };
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
        showSuccess("¡Pago aprobado!", `Tu plan ${plan?.nombre} ha sido activado exitosamente.`);
        setPasoPago("seleccion"); setMetodoPago("tarjeta");
        setDatosPago({ numero_tarjeta: "", titular: "", fecha_vencimiento: "", cvv: "" });
        await loadData();
      } else {
        showError("Pago rechazado", procesarData?.data?.mensaje || "Tu pago fue rechazado. Intenta con otro método.");
        setPasoPago("seleccion");
      }
    } catch (error) {
      showError("Error", error.message || "No se pudo procesar el pago.");
      setPasoPago("seleccion");
    } finally { setProcessing(false); }
  };

  const procesarTarjeta = async (e) => {
    e.preventDefault();
    if (!idPagoActual) return;
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/pagos/procesar`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({
          id_pago: idPagoActual, tipo: "plan",
          datos_pago: { numero_tarjeta: datosPago.numero_tarjeta, titular: datosPago.titular, fecha_vencimiento: datosPago.fecha_vencimiento, cvv: datosPago.cvv },
        }),
      });
      const data = await response.json();
      const plan = plans.find((p) => p.id_Plan === planForm.id_Plan);

      if (data?.success) {
        const updatedUser = { ...currentUser, id_Plan: planForm.id_Plan };
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
        showSuccess("¡Pago aprobado!", `Tu plan ${plan?.nombre} ha sido activado exitosamente.`);
        setPasoPago("seleccion"); setMetodoPago("tarjeta");
        setDatosPago({ numero_tarjeta: "", titular: "", fecha_vencimiento: "", cvv: "" });
        setIdPagoActual(null);
        await loadData();
      } else {
        showError("Pago rechazado", data?.data?.mensaje || "Tu tarjeta fue rechazada. Intenta con otra.");
      }
    } catch (error) { showError("Error", error.message || "No se pudo procesar el pago."); }
    finally { setProcessing(false); }
  };

  // ---- Service checkout ----
  const openServiceCheckout = (service) => {
    setServiceCheckout(service);
    setServiceMetodoPago("tarjeta");
    setServicePasoPago("seleccion");
    setServiceDatosPago({ numero_tarjeta: "", titular: "", fecha_vencimiento: "", cvv: "" });
    setServicePagoId(null);
  };

  const closeServiceCheckout = () => {
    setServiceCheckout(null);
    setServicePasoPago("seleccion");
  };

  const submitServiceCheckout = async () => {
    if (!serviceCheckout) return;
    setProcessing(true);
    try {
      const initRes = await fetch(`${API_URL}/pagos/servicio/simulado`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({
          id_Servicio: serviceCheckout.id_Servicio,
          metodo: serviceMetodoPago,
        }),
      });
      const initData = await initRes.json();
      if (!initRes.ok || !initData?.success) throw new Error(initData?.message || "No se pudo iniciar el pago.");

      const pagoId = initData.data.id_pago;
      setServicePagoId(pagoId);

      if (serviceMetodoPago === "tarjeta") { setServicePasoPago("formulario"); setProcessing(false); return; }

      const procesarRes = await fetch(`${API_URL}/pagos/procesar`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ id_pago: pagoId, tipo: "servicio", datos_pago: {} }),
      });
      const procesarData = await procesarRes.json();

      if (procesarData?.success) {
        showSuccess("¡Pago aprobado!", `El servicio "${serviceCheckout.titulo}" ha sido pagado exitosamente.`);
        closeServiceCheckout();
        await loadData();
      } else {
        showError("Pago rechazado", procesarData?.data?.mensaje || "Intenta con otro método.");
        setServicePasoPago("seleccion");
      }
    } catch (error) { showError("Error", error.message || "No se pudo procesar el pago."); setServicePasoPago("seleccion"); }
    finally { setProcessing(false); }
  };

  const procesarTarjetaServicio = async (e) => {
    e.preventDefault();
    if (!servicePagoId) return;
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/pagos/procesar`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({
          id_pago: servicePagoId, tipo: "servicio",
          datos_pago: { numero_tarjeta: serviceDatosPago.numero_tarjeta, titular: serviceDatosPago.titular, fecha_vencimiento: serviceDatosPago.fecha_vencimiento, cvv: serviceDatosPago.cvv },
        }),
      });
      const data = await response.json();

      if (data?.success) {
        showSuccess("¡Pago aprobado!", `El servicio "${serviceCheckout.titulo}" ha sido pagado exitosamente.`);
        closeServiceCheckout();
        await loadData();
      } else {
        showError("Pago rechazado", data?.data?.mensaje || "Tu tarjeta fue rechazada.");
      }
    } catch (error) { showError("Error", error.message || "No se pudo procesar el pago."); }
    finally { setProcessing(false); }
  };

  const currentPlan = plans.find(p => p.id_Plan === currentPlanId);
  const planSeleccionado = plans.find(p => p.id_Plan === planForm.id_Plan);
  const precioPlan = Number(planSeleccionado?.precioMensual ?? 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="mb-8">
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-72 h-5" />
        </div>
        <Skeleton className="w-full h-24 rounded-2xl mb-6" />
        <div className="flex gap-2 mb-6">
          <Skeleton className="w-44 h-10 rounded-lg" />
          <Skeleton className="w-28 h-10 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <Skeleton className="w-40 h-6" />
              <PlanCardSkeleton />
              <PlanCardSkeleton />
              <PlanCardSkeleton />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <Skeleton className="w-32 h-5 mb-4" />
              <div className="space-y-3">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Centro de Pagos</h1>
        <p className="text-slate-500 mt-1">Gestiona tus suscripciones, pagos de servicios e historial</p>
      </div>

      {/* Plan actual destacado */}
      {currentPlan && (
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-5 lg:p-6 mb-6 text-white shadow-lg shadow-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Plan activo</p>
              <h2 className="text-xl lg:text-2xl font-bold mt-1">{currentPlan.nombre}</h2>
              <p className="text-blue-100 mt-1 text-sm lg:text-base">
                ${Number(currentPlan.precioMensual || 0).toLocaleString("es-CO")} COP / mes
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg self-start sm:self-auto">
              <Shield size={18} />
              <span className="font-medium text-sm">Suscripción activa</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2" role="tablist" aria-label="Secciones de pagos">
        <button
          role="tab" aria-selected={activeTab === "plans"}
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
            activeTab === "plans" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <CreditCard size={16} /> Planes
        </button>

        <button
          role="tab" aria-selected={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
            activeTab === "history" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ReceiptText size={16} /> Historial
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* PLANS TAB */}
          {activeTab === "plans" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" /> Selecciona un plan
              </h2>

              <div className="grid gap-3">
                {plans.map((plan) => (
                  <label
                    key={plan.id_Plan}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      planForm.id_Plan === plan.id_Plan ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <input type="radio" name="plan" value={plan.id_Plan}
                      checked={planForm.id_Plan === plan.id_Plan}
                      onChange={(e) => setPlanForm((prev) => ({ ...prev, id_Plan: e.target.value }))}
                      className="sr-only" aria-label={`Plan ${plan.nombre}`}
                    />
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800">{plan.nombre}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{plan.descripcion || "Plan de suscripción"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-blue-600">${Number(plan.precioMensual || 0).toLocaleString("es-CO")}</p>
                        <p className="text-xs text-slate-500">COP/mes</p>
                      </div>
                    </div>
                    {planForm.id_Plan === plan.id_Plan && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* Payment method selection */}
              {pasoPago === "seleccion" && precioPlan > 0 && (
                <>
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-base font-semibold text-slate-800 mb-3">Método de pago</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {METODOS_PAGO.map((m) => {
                        const Icon = m.icono;
                        const colors = COLOR_MAP[m.color];
                        return (
                          <button key={m.id} type="button"
                            onClick={() => setMetodoPago(m.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                              metodoPago === m.id ? `${colors.border} ${colors.bg}` : "border-slate-200 hover:border-slate-300"
                            }`}
                            aria-pressed={metodoPago === m.id}
                          >
                            <Icon size={20} className={metodoPago === m.id ? colors.text : "text-slate-400"} />
                            <div>
                              <span className="text-sm font-medium text-slate-700 block">{m.nombre}</span>
                              <span className="text-xs text-slate-400">{m.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <form onSubmit={submitPlanPayment} className="mt-4 pt-4 border-t border-slate-200">
                    <button type="submit" disabled={processing || !planForm.id_Plan}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 hover:shadow-xl text-sm"
                    >
                      {processing ? (<><Loader2 className="animate-spin" size={18} /> Procesando pago...</>) : (<><CreditCard size={18} /> Pagar ${precioPlan.toLocaleString("es-CO")} COP</>)}
                    </button>
                  </form>
                </>
              )}

              {/* Card form */}
              {pasoPago === "formulario" && metodoPago === "tarjeta" && (
                <form onSubmit={procesarTarjeta} className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-600" /> Datos de la tarjeta
                    </h3>
                    <button type="button" onClick={() => { setPasoPago("seleccion"); setIdPagoActual(null); }}
                      className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <ChevronUp size={14} /> Cambiar
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Plan: {planSeleccionado?.nombre}</p>
                      <p className="text-lg font-bold text-blue-800">${precioPlan.toLocaleString("es-CO")} COP</p>
                    </div>
                    <Shield size={24} className="text-blue-300" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium text-slate-700 mb-1">Número de tarjeta</label>
                      <input id="card-number" type="text" inputMode="numeric" autoComplete="cc-number"
                        value={datosPago.numero_tarjeta}
                        onChange={(e) => setDatosPago(prev => ({ ...prev, numero_tarjeta: e.target.value.replace(/\D/g, "").slice(0, 16) }))}
                        placeholder="4242 4242 4242 4242"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                      <p className="text-xs text-slate-400 mt-1">Usa 4000, 5000 o 6000 para simular rechazo</p>
                    </div>
                    <div>
                      <label htmlFor="card-name" className="block text-sm font-medium text-slate-700 mb-1">Titular</label>
                      <input id="card-name" type="text" autoComplete="cc-name"
                        value={datosPago.titular}
                        onChange={(e) => setDatosPago(prev => ({ ...prev, titular: e.target.value }))}
                        placeholder="Nombre como aparece en la tarjeta"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="card-expiry" className="block text-sm font-medium text-slate-700 mb-1">Vencimiento</label>
                        <input id="card-expiry" type="text" inputMode="numeric" autoComplete="cc-exp"
                          value={datosPago.fecha_vencimiento}
                          onChange={(e) => setDatosPago(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                          placeholder="MM/AA"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvv" className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                        <input id="card-cvv" type="text" inputMode="numeric" autoComplete="cc-csc"
                          value={datosPago.cvv}
                          onChange={(e) => setDatosPago(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
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
            </div>
          )}

          {/* SERVICES TAB */}


          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ReceiptText size={18} className="text-blue-600" /> Historial de pagos
              </h2>

              {/* Sub-tabs */}
              <div className="flex gap-2 mb-5" role="tablist">
                <button role="tab" aria-selected={historySubTab === "planes"}
                  onClick={() => setHistorySubTab("planes")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    historySubTab === "planes" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Suscripciones
                </button>
                <button role="tab" aria-selected={historySubTab === "servicios"}
                  onClick={() => setHistorySubTab("servicios")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    historySubTab === "servicios" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Servicios
                </button>
              </div>

              {historySubTab === "planes" && (
                <div>
                  {history.pagos_plan?.length > 0 ? (
                    <div className="space-y-3">
                      {history.pagos_plan.map((pago) => {
                        const estadoClass = ESTADO_STYLES[pago.estado] || "bg-gray-50 text-gray-600 border border-gray-200";
                        return (
                          <div key={pago.id_PagoPlan}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <CreditCard size={18} className="text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 truncate">{pago.plan?.nombre || "Plan"}</p>
                                <p className="text-sm text-slate-500">
                                  {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "Sin fecha"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="font-semibold text-slate-800">${Number(pago.monto || 0).toLocaleString("es-CO")}</p>
                              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${estadoClass}`}>
                                {pago.estado}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ReceiptText size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">No hay pagos de suscripciones</p>
                      <p className="text-sm text-slate-400 mt-1">Tus pagos de planes aparecerán aquí</p>
                    </div>
                  )}
                </div>
              )}

              {historySubTab === "servicios" && (
                <div>
                  {history.pagos_servicio?.length > 0 ? (
                    <div className="space-y-3">
                      {history.pagos_servicio.map((pago) => {
                        const estadoClass = ESTADO_STYLES[pago.estado] || "bg-gray-50 text-gray-600 border border-gray-200";
                        return (
                          <div key={pago.id_PagoServicio}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <Wallet size={18} className="text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 truncate">{pago.servicio?.titulo || "Servicio"}</p>
                                <p className="text-sm text-slate-500">
                                  {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "Sin fecha"}
                                  {pago.referenciaPago && <span className="ml-2 text-slate-400">· Ref: {pago.referenciaPago}</span>}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="font-semibold text-slate-800">${Number(pago.monto || 0).toLocaleString("es-CO")}</p>
                              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${estadoClass}`}>
                                {pago.estado}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">No hay pagos de servicios</p>
                      <p className="text-sm text-slate-400 mt-1">Tus pagos de servicios aparecerán aquí</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Resumen */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-blue-600" /> Tu suscripción
            </h3>
            {currentPlan ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-medium text-slate-800">{currentPlan.nombre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Precio</span>
                  <span className="font-medium text-slate-800">${Number(currentPlan.precioMensual || 0).toLocaleString("es-CO")} COP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Estado</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle size={14} /> Activo
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No tienes un plan activo</p>
            )}
          </div>

          {/* Métodos de pago */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" /> Métodos disponibles
            </h3>
            <div className="space-y-2">
              {METODOS_PAGO.map((m) => {
                const Icon = m.icono;
                return (
                  <div key={m.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                    <Icon size={16} className="text-slate-500 shrink-0" />
                    <div>
                      <span className="text-sm text-slate-700 font-medium">{m.nombre}</span>
                      <span className="text-xs text-slate-400 block">{m.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Pagos simulados</p>
                <p className="text-xs text-blue-700 mt-1">
                  Este es un entorno de pruebas. Los pagos se procesan de forma simulada y no implican transacciones reales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Checkout Modal */}
      {serviceCheckout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full sm:max-w-lg sm:rounded-2xl bg-white shadow-2xl flex flex-col sm:max-h-[90vh] max-h-[95dvh] overflow-hidden">
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <button onClick={closeServiceCheckout}
              className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-full"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col overflow-y-auto overscroll-contain">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 pb-4 text-white">
                <p className="text-blue-100 text-xs font-medium mb-1">Pago de servicio</p>
                <h2 className="text-lg font-bold leading-tight">{serviceCheckout.titulo}</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {serviceCheckout.categoria?.nombre || "General"} · {serviceCheckout.tipo === "oportunidad" ? "Oportunidad" : "Servicio"}
                </p>
              </div>

              <div className="p-5">
                {/* Price */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Total a pagar</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {serviceCheckout.precio ? `$${Number(serviceCheckout.precio).toLocaleString("es-CO")}` : "A convenir"}
                    </p>
                  </div>
                  <Shield size={28} className="text-blue-300" />
                </div>

                {/* Method selection */}
                {servicePasoPago === "seleccion" && (
                  <>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Método de pago</h3>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {METODOS_PAGO.map((m) => {
                        const Icon = m.icono;
                        const colors = COLOR_MAP[m.color];
                        return (
                          <button key={m.id} type="button"
                            onClick={() => setServiceMetodoPago(m.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                              serviceMetodoPago === m.id ? `${colors.border} ${colors.bg}` : "border-slate-200 hover:border-slate-300"
                            }`}
                            aria-pressed={serviceMetodoPago === m.id}
                          >
                            <Icon size={18} className={serviceMetodoPago === m.id ? colors.text : "text-slate-400"} />
                            <span className="text-sm font-medium text-slate-700">{m.nombre}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button onClick={submitServiceCheckout} disabled={processing}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 text-sm"
                    >
                      {processing ? (<><Loader2 className="animate-spin" size={18} /> Procesando...</>) : (<><CreditCard size={18} /> Continuar con el pago</>)}
                    </button>
                  </>
                )}

                {/* Card form for service */}
                {servicePasoPago === "formulario" && (
                  <form onSubmit={procesarTarjetaServicio}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <CreditCard size={16} className="text-blue-600" /> Datos de la tarjeta
                      </h3>
                      <button type="button" onClick={() => { setServicePasoPago("seleccion"); setServicePagoId(null); }}
                        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      >
                        <ArrowLeft size={14} /> Volver
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="svc-card-number" className="block text-sm font-medium text-slate-700 mb-1">Número de tarjeta</label>
                        <input id="svc-card-number" type="text" inputMode="numeric" autoComplete="cc-number"
                          value={serviceDatosPago.numero_tarjeta}
                          onChange={(e) => setServiceDatosPago(prev => ({ ...prev, numero_tarjeta: e.target.value.replace(/\D/g, "").slice(0, 16) }))}
                          placeholder="4242 4242 4242 4242"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="svc-card-name" className="block text-sm font-medium text-slate-700 mb-1">Titular</label>
                        <input id="svc-card-name" type="text" autoComplete="cc-name"
                          value={serviceDatosPago.titular}
                          onChange={(e) => setServiceDatosPago(prev => ({ ...prev, titular: e.target.value }))}
                          placeholder="Nombre completo"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="svc-card-expiry" className="block text-sm font-medium text-slate-700 mb-1">Vencimiento</label>
                          <input id="svc-card-expiry" type="text" inputMode="numeric" autoComplete="cc-exp"
                            value={serviceDatosPago.fecha_vencimiento}
                            onChange={(e) => setServiceDatosPago(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                            placeholder="MM/AA"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="svc-card-cvv" className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                          <input id="svc-card-cvv" type="text" inputMode="numeric" autoComplete="cc-csc"
                            value={serviceDatosPago.cvv}
                            onChange={(e) => setServiceDatosPago(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
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
              </div>
            </div>
          </div>
        </div>
      )}

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => { setShowRatingModal(false); setPendingRatingService(null); }}
        onSubmit={async ({ ratingUsuario, ratingServicio, comment }) => {
          setRatingLoading(true);
          try {
            await fetch(`${API_URL}/resenas`, {
              method: "POST", headers: authHeaders(),
              body: JSON.stringify({
                id_Postulacion: pendingRatingService?.id_Postulacion,
                id_Servicio: pendingRatingService?.id_Servicio,
                calificacion_usuario: ratingUsuario,
                calificacion_servicio: ratingServicio,
                comentario: comment || '',
              }),
            });
            setShowRatingModal(false); setPendingRatingService(null);
          } catch (err) { console.error("Error submitting rating:", err); showError('Error', 'No se pudo enviar la calificación.'); }
          finally { setRatingLoading(false); }
        }}
        subtitle={`¿Cómo fue tu experiencia con ${pendingRatingService?.titulo || 'este servicio'}?`}
        tipo={pendingRatingService?.tipo || "servicio"}
        rolCalificado={pendingRatingService?.rolCalificado || "ofertante"}
        usuarioCalificador={currentUserEmail}
        usuarioCalificado={pendingRatingService?.usuarioCalificado}
        loading={ratingLoading}
      />
    </div>
  );
}
