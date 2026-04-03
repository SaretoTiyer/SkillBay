import { useEffect, useMemo, useState } from "react";
import { CreditCard, Loader2, ReceiptText, CheckCircle, Clock, Shield, Wallet, Smartphone, Banknote, QrCode, ChevronDown, ChevronUp } from "lucide-react";
import Swal from "sweetalert2";
import { showSuccess, showError, showInfo } from "../../utils/swalHelpers";
import { API_URL } from "../../config/api";
import RatingModal from "../../components/RatingModal";
import { determinarContextoCalificacion } from "../../utils/ratingContext";

const METODOS_PAGO = [
  { id: "tarjeta", nombre: "Tarjeta de Crédito/Débito", icono: CreditCard, categoria: "digital", requiereDatos: true },
  { id: "nequi", nombre: "Nequi", icono: Smartphone, categoria: "digital", requiereDatos: false },
  { id: "bancolombia_qr", nombre: "QR Bancolombia", icono: QrCode, categoria: "digital", requiereDatos: false },
  { id: "efectivo", nombre: "Efectivo", icono: Banknote, categoria: "efectivo", requiereDatos: false },
];

export default function UserPayments() {
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [history, setHistory] = useState({ pagos_plan: [], pagos_servicio: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");

  const [planForm, setPlanForm] = useState({
    id_Plan: "",
    modalidadPago: "virtual",
  });

  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [pasoPago, setPasoPago] = useState("seleccion");
  const [datosPago, setDatosPago] = useState({
    numero_tarjeta: "",
    titular: "",
    fecha_vencimiento: "",
    cvv: "",
  });
  const [idPagoActual, setIdPagoActual] = useState(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingRatingService, setPendingRatingService] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [serviceForm, setServiceForm] = useState({
    id_Servicio: "",
    modalidadPago: "virtual",
    modalidadServicio: "virtual",
    identificacionCliente: "",
    origenSolicitud: "servicio",
    id_Postulacion: "",
  });

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "{}");
    } catch {
      return {};
    }
  }, []);

  const currentPlanId = currentUser?.id_Plan || "";

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   const fetchCurrentUser = async () => {
     try {
       const response = await fetch(`${API_URL}/user`, { headers: authHeaders() });
       if (response.ok) {
         const data = await response.json();
         if (data.usuario) {
           setCurrentUserEmail(data.usuario.id_CorreoUsuario);
         }
       }
     } catch (err) {
       console.error("Error fetching current user:", err);
     }
   };

   const loadData = async () => {
     try {
       const [plansRes, servicesRes, historyRes] = await Promise.all([
         fetch(`${API_URL}/planes`, { headers: { Accept: "application/json" } }),
         fetch(`${API_URL}/servicios/explore`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}`, Accept: "application/json" } }),
         fetch(`${API_URL}/pagos/historial`, { headers: authHeaders() }),
         fetchCurrentUser()
       ]);

       const plansData = await plansRes.json();
      const servicesData = servicesRes.ok ? await servicesRes.json() : [];
      const historyData = historyRes.ok ? await historyRes.json() : { pagos_plan: [], pagos_servicio: [] };

      const plansList = Array.isArray(plansData?.planes) ? plansData.planes : [];
      setPlans(plansList);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setHistory(historyData);
      setPlanForm((prev) => ({ ...prev, id_Plan: plansList.find((p) => p.id_Plan !== currentPlanId)?.id_Plan || plansList[0]?.id_Plan || "" }));
      setServiceForm((prev) => ({ ...prev, id_Servicio: servicesData?.[0]?.id_Servicio || "" }));
    } catch (error) {
      console.error("Error loading payments data:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitPlanPayment = async (e) => {
    e.preventDefault();
    if (!planForm.id_Plan) return;

    const plan = plans.find((p) => p.id_Plan === planForm.id_Plan);
    const precio = Number(plan?.precioMensual ?? 0);

    if (precio <= 0) {
      try {
        const response = await fetch(`${API_URL}/pagos/plan`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ id_Plan: planForm.id_Plan, modalidadPago: "virtual" }),
        });
        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "No se pudo activar el plan.");
        }
        const updatedUser = { ...currentUser, id_Plan: planForm.id_Plan };
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
        showSuccess("¡Plan activado!", `El plan ${plan?.nombre} ha sido activado exitosamente.`);
        await loadData();
      } catch (error) {
        showError("Error", error.message || "No se pudo activar el plan.");
      }
      return;
    }

    setProcessing(true);
    try {
      const initRes = await fetch(`${API_URL}/pagos/plan/simulado`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          id_plan: planForm.id_Plan,
          metodo: metodoPago,
        }),
      });
      const initData = await initRes.json();
      if (!initRes.ok || !initData?.success) {
        throw new Error(initData?.message || "No se pudo iniciar el pago.");
      }

      const pagoId = initData.data.id_pago;
      setIdPagoActual(pagoId);

      if (metodoPago === "tarjeta") {
        setPasoPago("formulario");
        setProcessing(false);
        return;
      }

      const procesarRes = await fetch(`${API_URL}/pagos/procesar`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          id_pago: pagoId,
          tipo: "plan",
          datos_pago: metodoPago === "nequi" || metodoPago === "bancolombia_qr"
            ? { cuenta_banco: "transferencia_realizada" }
            : {},
        }),
      });
      const procesarData = await procesarRes.json();

      if (procesarData?.success) {
        const updatedUser = { ...currentUser, id_Plan: planForm.id_Plan };
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
        showSuccess("¡Pago aprobado!", `Tu plan ${plan?.nombre} ha sido activado exitosamente.`);
        setPasoPago("seleccion");
        setMetodoPago("tarjeta");
        setDatosPago({ numero_tarjeta: "", titular: "", fecha_vencimiento: "", cvv: "" });
        await loadData();
      } else {
        showError("Pago rechazado", procesarData?.data?.mensaje || "Tu pago fue rechazado. Intenta con otro método.");
        setPasoPago("seleccion");
      }
    } catch (error) {
      showError("Error", error.message || "No se pudo procesar el pago.");
      setPasoPago("seleccion");
    } finally {
      setProcessing(false);
    }
  };

  const procesarTarjeta = async (e) => {
    e.preventDefault();
    if (!idPagoActual) return;

    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/pagos/procesar`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          id_pago: idPagoActual,
          tipo: "plan",
          datos_pago: {
            numero_tarjeta: datosPago.numero_tarjeta,
            titular: datosPago.titular,
            fecha_vencimiento: datosPago.fecha_vencimiento,
            cvv: datosPago.cvv,
          },
        }),
      });
      const data = await response.json();

      const plan = plans.find((p) => p.id_Plan === planForm.id_Plan);

      if (data?.success) {
        const updatedUser = { ...currentUser, id_Plan: planForm.id_Plan };
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
        showSuccess("¡Pago aprobado!", `Tu plan ${plan?.nombre} ha sido activado exitosamente.`);
        setPasoPago("seleccion");
        setMetodoPago("tarjeta");
        setDatosPago({ numero_tarjeta: "", titular: "", fecha_vencimiento: "", cvv: "" });
        setIdPagoActual(null);
        await loadData();
      } else {
        showError("Pago rechazado", data?.data?.mensaje || "Tu tarjeta fue rechazada. Intenta con otra.");
      }
    } catch (error) {
      showError("Error", error.message || "No se pudo procesar el pago.");
    } finally {
      setProcessing(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const submitServicePayment = async (e) => {
    e.preventDefault();
    if (!serviceForm.id_Servicio || !serviceForm.identificacionCliente) {
      return showInfo("Campos requeridos", "Completa servicio e identificación.");
    }
    setProcessing(true);
    try {
      const payload = {
        ...serviceForm,
        id_Postulacion: serviceForm.id_Postulacion ? Number(serviceForm.id_Postulacion) : null,
      };

      const response = await fetch(`${API_URL}/pagos/servicio`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo procesar el pago del servicio.");

      Swal.fire({
        title: "¡Pago registrado!",
        html: `
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <p class="text-slate-600">El pago del servicio ha sido procesado</p>
            <p class="text-sm text-slate-500 mt-2">Referencia: ${data?.pago?.referenciaPago || "-"}</p>
          </div>
        `,
        icon: "success",
      });
      
      const selectedService = services.find(s => s.id_Servicio === serviceForm.id_Servicio);
      if (selectedService) {
        const contexto = determinarContextoCalificacion(
          selectedService?.tipo || 'servicio',
          currentUserEmail,
          selectedService?.id_Dueno,
          currentUserEmail
        );

        if (!contexto.error) {
          setPendingRatingService({
            id_Servicio: serviceForm.id_Servicio,
            titulo: selectedService.titulo,
            tipo: selectedService?.tipo || 'servicio',
            metodoPago: serviceForm.modalidadPago,
            id_Postulacion: serviceForm.id_Postulacion || null,
            usuarioCalificado: contexto.usuarioCalificado,
            rolCalificado: contexto.rolCalificado,
            showServiceRating: contexto.showServiceRating,
          });
          setShowRatingModal(true);
        }
      }
      
      await loadData();
    } catch (error) {
      showError("Error", error.message || "No se pudo registrar el pago.");
    } finally {
      setProcessing(false);
    }
  };

  const currentPlan = plans.find(p => p.id_Plan === currentPlanId);
  const planSeleccionado = plans.find(p => p.id_Plan === planForm.id_Plan);
  const precioPlan = Number(planSeleccionado?.precioMensual ?? 0);
  const MetodoIcon = METODOS_PAGO.find(m => m.id === metodoPago)?.icono || CreditCard;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Centro de Pagos</h1>
        <p className="text-slate-500 mt-1">Gestiona tus suscripciones y pagos de servicios</p>
      </div>

      {/* Plan actual destacado */}
      {currentPlan && (
        <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Plan activo</p>
              <h2 className="text-2xl font-bold mt-1">{currentPlan.nombre}</h2>
              <p className="text-blue-100 mt-1">
                ${Number(currentPlan.precioMensual || 0).toLocaleString("es-CO")} COP / mes
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Shield size={20} />
              <span className="font-medium">Suscripción activa</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "plans"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <CreditCard size={18} />
          Planes de Suscripción
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "history"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ReceiptText size={18} />
          Historial
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel principal */}
        <div className="lg:col-span-2">
          {activeTab === "plans" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard size={20} /> Selecciona un plan
              </h2>
              
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <label
                    key={plan.id_Plan}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      planForm.id_Plan === plan.id_Plan
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id_Plan}
                      checked={planForm.id_Plan === plan.id_Plan}
                      onChange={(e) => setPlanForm((prev) => ({ ...prev, id_Plan: e.target.value }))}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-800">{plan.nombre}</h3>
                        <p className="text-sm text-slate-500 mt-1">{plan.descripcion || "Plan de suscripción"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          ${Number(plan.precioMensual || 0).toLocaleString("es-CO")}
                        </p>
                        <p className="text-xs text-slate-500">COP/mes</p>
                      </div>
                    </div>
                    {planForm.id_Plan === plan.id_Plan && (
                      <CheckCircle className="absolute top-2 right-2 text-blue-500" size={20} />
                    )}
                  </label>
                ))}
              </div>

              {/* Selección de método de pago */}
              {pasoPago === "seleccion" && (
                <>
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Método de pago</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {METODOS_PAGO.map((m) => {
                        const Icon = m.icono;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMetodoPago(m.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                              metodoPago === m.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <Icon size={20} className={metodoPago === m.id ? "text-blue-600" : "text-slate-400"} />
                            <span className="text-sm font-medium text-slate-700">{m.nombre}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <form onSubmit={submitPlanPayment} className="mt-4 pt-4 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={processing || !planForm.id_Plan}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Procesando pago...
                        </>
                      ) : (
                        <>
                          <MetodoIcon size={20} />
                          Pagar ${precioPlan.toLocaleString("es-CO")} COP
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* Formulario de tarjeta */}
              {pasoPago === "formulario" && metodoPago === "tarjeta" && (
                <form onSubmit={procesarTarjeta} className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <CreditCard size={20} className="text-blue-600" />
                      Datos de la tarjeta
                    </h3>
                    <button
                      type="button"
                      onClick={() => { setPasoPago("seleccion"); setIdPagoActual(null); }}
                      className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <ChevronUp size={16} /> Cambiar método
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-blue-700 font-medium">Plan: {planSeleccionado?.nombre}</p>
                    <p className="text-lg font-bold text-blue-800">${precioPlan.toLocaleString("es-CO")} COP</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número de tarjeta</label>
                      <input
                        type="text"
                        value={datosPago.numero_tarjeta}
                        onChange={(e) => setDatosPago(prev => ({ ...prev, numero_tarjeta: e.target.value.replace(/\D/g, "").slice(0, 16) }))}
                        placeholder="4242 4242 4242 4242"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <p className="text-xs text-slate-400 mt-1">Usa 4000, 5000 o 6000 para simular rechazo</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Titular</label>
                      <input
                        type="text"
                        value={datosPago.titular}
                        onChange={(e) => setDatosPago(prev => ({ ...prev, titular: e.target.value }))}
                        placeholder="Nombre completo"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vencimiento</label>
                        <input
                          type="text"
                          value={datosPago.fecha_vencimiento}
                          onChange={(e) => setDatosPago(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                          placeholder="MM/AA"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                        <input
                          type="text"
                          value={datosPago.cvv}
                          onChange={(e) => setDatosPago(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                          placeholder="123"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Shield size={18} />
                        Confirmar pago
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ReceiptText size={20} /> Historial de pagos
              </h2>

              {/* Pagos de planes */}
              <div className="mb-6">
                <h3 className="font-medium text-slate-700 mb-3">Suscripciones</h3>
                {history.pagos_plan?.length > 0 ? (
                  <div className="space-y-3">
                    {history.pagos_plan.map((pago) => (
                      <div key={pago.id_PagoPlan} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">{pago.plan?.nombre || "Plan"}</p>
                          <p className="text-sm text-slate-500">{new Date(pago.fechaPago).toLocaleDateString("es-CO")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">${Number(pago.monto || 0).toLocaleString("es-CO")}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            pago.estado === 'Completado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {pago.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No hay pagos de planes</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Resumen del plan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Tu suscripción</h3>
            {currentPlan ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-medium text-slate-800">{currentPlan.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Precio</span>
                  <span className="font-medium text-slate-800">${Number(currentPlan.precioMensual || 0).toLocaleString("es-CO")} COP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle size={14} /> Activo
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No tienes un plan activo</p>
            )}
          </div>

          {/* Métodos de pago */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Métodos de pago</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <CreditCard size={18} className="text-slate-500" />
                <span className="text-sm text-slate-700">Tarjeta de crédito/débito</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <Smartphone size={18} className="text-slate-500" />
                <span className="text-sm text-slate-700">Nequi</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <QrCode size={18} className="text-slate-500" />
                <span className="text-sm text-slate-700">QR Bancolombia</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <Banknote size={18} className="text-slate-500" />
                <span className="text-sm text-slate-700">Efectivo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

       <RatingModal
         isOpen={showRatingModal}
         onClose={() => {
           setShowRatingModal(false);
           setPendingRatingService(null);
         }}
         onSubmit={async ({ ratingUsuario, ratingServicio, comment }) => {
           setRatingLoading(true);
           try {
             await fetch(`${API_URL}/resenas`, {
               method: "POST",
               headers: authHeaders(),
               body: JSON.stringify({
                 id_Postulacion: pendingRatingService?.id_Postulacion,
                 id_Servicio: pendingRatingService?.id_Servicio,
                 calificacion_usuario: ratingUsuario,
                 calificacion_servicio: ratingServicio,
                 comentario: comment || '',
               }),
             });
             setShowRatingModal(false);
             setPendingRatingService(null);
           } catch (err) {
             console.error("Error submitting rating:", err);
             showError('Error', 'No se pudo enviar la calificación.');
           } finally {
             setRatingLoading(false);
           }
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
