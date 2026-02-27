import { useEffect, useMemo, useState } from "react";
import { CreditCard, Loader2, ReceiptText, CheckCircle, Clock, Shield, ExternalLink } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

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
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, servicesRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/planes`, { headers: { Accept: "application/json" } }),
        fetch(`${API_URL}/servicios/explore`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}`, Accept: "application/json" } }),
        fetch(`${API_URL}/pagos/historial`, { headers: authHeaders() }),
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

    setProcessing(true);
    try {
      // Crear preferencia de pago con MercadoPago
      const response = await fetch(`${API_URL}/mp/crear-preferencia`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id_Plan: planForm.id_Plan }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "No se pudo iniciar el proceso de pago.");
      }

      // Plan gratuito: activado directamente
      if (data?.gratuito) {
        const updatedUser = { ...currentUser, id_Plan: planForm.id_Plan };
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
        Swal.fire({
          title: "¡Plan activado!",
          text: `El plan ${plan?.nombre} ha sido activado exitosamente.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        await loadData();
        return;
      }

      // Plan de pago: redirigir a MercadoPago Checkout Pro
      const checkoutUrl = data?.sandbox_init_point || data?.init_point;
      if (!checkoutUrl) throw new Error("No se recibió la URL de pago de MercadoPago.");

      const { isConfirmed } = await Swal.fire({
        title: `Pagar Plan ${plan?.nombre}`,
        html: `
          <div class="text-center py-2">
            <p class="text-slate-600 mb-3">Serás redirigido a MercadoPago para completar tu pago de forma segura.</p>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
              <p class="text-sm text-blue-700 font-medium">Monto a pagar</p>
              <p class="text-2xl font-bold text-blue-800">$${precio.toLocaleString("es-CO")} COP</p>
              <p class="text-xs text-blue-600">/ mes</p>
            </div>
            <p class="text-xs text-slate-400">Referencia: ${data?.referencia || "-"}</p>
          </div>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Ir a MercadoPago",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#009ee3",
      });

      if (isConfirmed) {
        window.open(checkoutUrl, "_blank");
        Swal.fire({
          title: "Procesando pago...",
          html: `
            <div class="text-center py-4">
              <p class="text-slate-600 mb-4">Completa el pago en la ventana de MercadoPago.</p>
              <p class="text-sm text-slate-500">Una vez aprobado, tu plan se activará automáticamente.</p>
              <p class="text-xs text-slate-400 mt-3">Referencia: ${data?.referencia || "-"}</p>
            </div>
          `,
          icon: "info",
          showConfirmButton: true,
          confirmButtonText: "Ya pagué, verificar",
          showCancelButton: true,
          cancelButtonText: "Cerrar",
        }).then(async (result) => {
          if (result.isConfirmed && data?.referencia) {
            // Verificar estado del pago
            try {
              const estadoRes = await fetch(`${API_URL}/mp/estado/${data.referencia}`, {
                headers: authHeaders(),
              });
              const estadoData = await estadoRes.json();
              if (estadoData?.aprobado || estadoData?.estado === "Completado") {
                const updatedUser = { ...currentUser, id_Plan: planForm.id_Plan };
                localStorage.setItem("usuario", JSON.stringify(updatedUser));
                Swal.fire({ title: "¡Plan activado!", icon: "success", timer: 2000, showConfirmButton: false });
                await loadData();
              } else {
                Swal.fire("Estado del pago", `Estado: ${estadoData?.estado || "Pendiente"}`, "info");
              }
            } catch (err) {
              console.error("Error al verificar estado:", err);
            }
          }
        });
      }
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo pagar el plan.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const submitServicePayment = async (e) => {
    e.preventDefault();
    if (!serviceForm.id_Servicio || !serviceForm.identificacionCliente) {
      return Swal.fire("Campos requeridos", "Completa servicio e identificación.", "info");
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
      
      // Después del pago exitoso, ofrecer calificar
      const selectedService = services.find(s => s.id_Servicio === serviceForm.id_Servicio);
      if (selectedService) {
        const { value: ratingData } = await Swal.fire({
          title: "Califica tu experiencia",
          html: `
            <div class="py-4">
              <p class="mb-4 text-slate-600">¿Cómo fue tu experiencia con este servicio?</p>
              <div class="flex justify-center gap-2 mb-4" id="star-rating">
                ${[1,2,3,4,5].map(i => `<button type="button" class="star-btn text-3xl text-slate-300 hover:text-yellow-400 transition-colors" data-rating="${i}">★</button>`).join('')}
              </div>
              <textarea id="rating-comment" class="swal2-textarea" placeholder="Escribe un comentario sobre tu experiencia (opcional)"></textarea>
            </div>
          `,
          preConfirm: () => {
            const selectedStar = document.querySelector('.star-btn.text-yellow-400');
            const comment = document.getElementById('rating-comment')?.value;
            return {
              rating: selectedStar?.dataset.rating || 5,
              comment: comment || ""
            };
          },
          showCancelButton: true,
          confirmButtonText: "Enviar calificación",
          cancelButtonText: "Ahora no",
        });

        if (ratingData) {
          try {
            await fetch(`${API_URL}/resenas`, {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({
                id_Servicio: serviceForm.id_Servicio,
                calificacion: ratingData.rating,
                comentario: ratingData.comment,
                metodoPago: serviceForm.modalidadPago,
              }),
            });
          } catch (err) {
            console.error("Error submitting rating:", err);
          }
        }
      }
      
      await loadData();
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo registrar el pago.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const currentPlan = plans.find(p => p.id_Plan === currentPlanId);
  const selectedService = services.find(s => s.id_Servicio === serviceForm.id_Servicio);

  // Agregar event listeners para las estrellas después de renderizar
  useEffect(() => {
    const starButtons = document.querySelectorAll('.star-btn');
    starButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        starButtons.forEach(b => b.classList.remove('text-yellow-400'));
        starButtons.forEach(b => b.classList.add('text-slate-300'));
        this.classList.remove('text-slate-300');
        this.classList.add('text-yellow-400');
      });
      btn.addEventListener('mouseenter', function() {
        const rating = parseInt(this.dataset.rating);
        starButtons.forEach((b, idx) => {
          if (idx < rating) {
            b.classList.add('text-yellow-400');
          }
        });
      });
      btn.addEventListener('mouseleave', function() {
        starButtons.forEach(b => {
          if (!b.classList.contains('clicked')) {
            b.classList.remove('text-yellow-400');
            b.classList.add('text-slate-300');
          }
        });
      });
    });
  });

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

              <form onSubmit={submitPlanPayment} className="mt-6 pt-6 border-t border-slate-200">
                {/* Indicador de pago seguro */}
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-4">
                  <ExternalLink size={12} />
                  <span>Pago seguro procesado por MercadoPago</span>
                </div>
                <button
                  type="submit"
                  disabled={processing || !planForm.id_Plan}
                  className="w-full bg-[#009ee3] hover:bg-[#0082c0] disabled:bg-slate-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Pagar con MercadoPago
                    </>
                  )}
                </button>
              </form>
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
                            pago.estado === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
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
                <span className="text-sm text-slate-700">Pago virtual</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <CreditCard size={18} className="text-slate-500" />
                <span className="text-sm text-slate-700">Pago en efectivo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
