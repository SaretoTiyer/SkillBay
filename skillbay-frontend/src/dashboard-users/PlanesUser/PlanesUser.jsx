import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CreditCard, Loader2, ExternalLink, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";
import { Button } from "../../components/ui/Button";

const fallbackPlans = [
  {
    id_Plan: "Free",
    nombre: "Free",
    beneficios: "Puede tener hasta 3 servicios propios. Limite mensual de servicios: 3.",
    precioMensual: 0,
    limiteServiciosMes: 3,
  },
  {
    id_Plan: "Plus",
    nombre: "Plus",
    beneficios: "Puede tener hasta 5 servicios propios. Limite mensual de servicios: 5.",
    precioMensual: 15000,
    limiteServiciosMes: 5,
  },
  {
    id_Plan: "Ultra",
    nombre: "Ultra",
    beneficios: "Puede tener hasta 10 servicios propios. Limite mensual de servicios: 10.",
    precioMensual: 30000,
    limiteServiciosMes: 10,
  },
];

export default function PlanesUser() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingPlanId, setUpdatingPlanId] = useState(null);

  const currentUser = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("usuario");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  }, []);

  const currentPlanId = currentUser?.id_Plan ?? null;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/planes`, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(Array.isArray(data?.planes) ? data.planes : fallbackPlans);
      } else {
        setPlans(fallbackPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicia el flujo de pago simulado.
   * Para planes gratuitos, activa directamente sin pasarela.
   */
  const selectPlan = async (idPlan) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      Swal.fire("Sesión expirada", "Inicia sesión nuevamente.", "warning");
      return;
    }

    const plan = plans.find((p) => p.id_Plan === idPlan);
    const precio = Number(plan?.precioMensual ?? 0);

    // Plan gratuito: activado directamente
    if (precio === 0) {
      setUpdatingPlanId(idPlan);
      try {
        const response = await fetch(`${API_URL}/pagos/plan`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ id_Plan: idPlan }),
        });

        if (response.ok) {
          const savedUser = { ...currentUser, id_Plan: idPlan };
          localStorage.setItem("usuario", JSON.stringify(savedUser));

          await Swal.fire({
            icon: "success",
            title: "¡Plan activado!",
            text: `El plan ${plan?.nombre} ha sido activado exitosamente.`,
            timer: 2000,
            showConfirmButton: false,
          });
          window.location.reload();
        }
      } catch (error) {
        console.error("Error activating plan:", error);
        Swal.fire("Error", "No se pudo activar el plan gratuito.", "error");
      } finally {
        setUpdatingPlanId(null);
      }
      return;
    }

    // Plan de pago: usar checkout simulado
    setUpdatingPlanId(idPlan);

    try {
      const { isConfirmed } = await Swal.fire({
        title: `Pagar Plan ${plan?.nombre}`,
        html: `
          <div class="text-center py-2">
            <p class="text-slate-600 mb-3">Serás redirigido al checkout simulado para completar tu pago de forma segura.</p>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
              <p class="text-sm text-blue-700 font-medium">Monto a pagar</p>
              <p class="text-2xl font-bold text-blue-800">$${precio.toLocaleString("es-CO")} COP</p>
              <p class="text-xs text-blue-600">/ mes</p>
            </div>
            <p class="text-xs text-slate-400">Modo: Simulación de pago</p>
          </div>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Ir al Checkout",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2563eb",
      });

      if (isConfirmed) {
        // Guardar datos del checkout y navegar
        localStorage.setItem("checkout_data", JSON.stringify({
          tipo: "plan",
          idItem: idPlan,
          monto: precio,
          descripcion: `Plan ${plan?.nombre}`,
        }));

        // Redirigir a la vista de checkout
        window.location.hash = "#checkout";
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al iniciar pago:", error);
      Swal.fire("Error", error.message || "No se pudo iniciar el proceso de pago.", "error");
    } finally {
      setUpdatingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-200">
          <CreditCard className="text-white h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Planes</h1>
          <p className="text-slate-500 font-medium">Elige el plan que mejor se ajusta a tu crecimiento.</p>
        </div>
      </div>

      {/* Banner de Pago Simulado */}
      <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 mb-8 flex items-center gap-3">
        <div className="bg-white/20 rounded-xl p-2">
          <CreditCard className="text-white" size={24} />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Pagos seguros simulados</p>
          <p className="text-blue-100 text-xs">Acepta tarjetas y Efectivo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id_Plan;
          const isUpdating = updatingPlanId === plan.id_Plan;
          const esPago = Number(plan.precioMensual) > 0;

          return (
            <div
              key={plan.id_Plan}
              className={`rounded-3xl border bg-white shadow-sm p-6 flex flex-col transition-all ${
                isCurrentPlan ? "border-emerald-400 shadow-emerald-100" : "border-slate-200 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">{plan.nombre}</h2>
                {isCurrentPlan && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 text-sm font-semibold">
                    <BadgeCheck size={16} />
                    Actual
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-5">{plan.beneficios}</p>

              <div className="space-y-2 mb-6">
                <p className="text-sm text-slate-500">
                  Limite mensual:{" "}
                  <span className="font-semibold text-slate-700">{plan.limiteServiciosMes} servicios</span>
                </p>
                <p className="text-sm text-slate-500">
                  Precio mensual:{" "}
                  <span className="font-semibold text-slate-700">
                    {Number(plan.precioMensual) === 0
                      ? "Gratis"
                      : `$${Number(plan.precioMensual).toLocaleString("es-CO")} COP`}
                  </span>
                </p>
              </div>

              {/* Indicador de método de pago */}
              {esPago && !isCurrentPlan && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-4">
                  <ExternalLink size={12} />
                  <span>Pago seguro simulado</span>
                </div>
              )}

              <Button
                disabled={isCurrentPlan || isUpdating}
                onClick={() => selectPlan(plan.id_Plan)}
                className={`mt-auto rounded-xl ${
                  isCurrentPlan
                    ? "bg-emerald-600 hover:bg-emerald-600"
                    : esPago
                    ? "bg-[#009ee3] hover:bg-[#0082c0]"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {isCurrentPlan ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Plan activo
                  </span>
                ) : isUpdating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Procesando...
                  </span>
                ) : esPago ? (
                  <span className="flex items-center gap-2">
                    <CreditCard size={16} />
                    Pagar ahora
                  </span>
                ) : (
                  "Activar plan gratuito"
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Nota de seguridad */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          🔒 Esta es una simulación de pago para Manifestación. No se procesará dinero real.
        </p>
      </div>
    </div>
  );
}
