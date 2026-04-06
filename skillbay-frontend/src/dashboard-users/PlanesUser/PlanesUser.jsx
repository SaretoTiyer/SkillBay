import { useEffect, useMemo, useState, useCallback } from "react";
import { BadgeCheck, CreditCard, Loader2, ExternalLink, CheckCircle, Crown, Star, Zap, Shield } from "lucide-react";
import Swal from "sweetalert2";
import { showSuccess, showError, showWarning, showConfirm } from "../../utils/swalHelpers";
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

const PLAN_FEATURES = {
  Free: {
    icon: Shield,
    color: "gray",
    features: ["Hasta 3 servicios", "Soporte básico", "Perfil público"],
  },
  Plus: {
    icon: Star,
    color: "blue",
    features: ["Hasta 5 servicios", "Soporte prioritario", "Badge verificado", "Mayor visibilidad"],
  },
  Ultra: {
    icon: Crown,
    color: "amber",
    features: ["Hasta 10 servicios", "Soporte VIP", "Badge premium", "Máxima visibilidad", "Estadísticas avanzadas"],
  },
};

// ============================================
// PLAN CARD COMPONENT
// ============================================

function PlanCard({ plan, isCurrentPlan, isUpdating, onSelect }) {
  const esPago = Number(plan.precioMensual) > 0;
  const features = PLAN_FEATURES[plan.id_Plan] || PLAN_FEATURES.Free;
  const Icon = features.icon;
  const colorMap = {
    gray: "from-gray-500 to-gray-600",
    blue: "from-blue-500 to-indigo-600",
    amber: "from-amber-400 to-yellow-500",
  };

  return (
    <div
      className={`rounded-3xl border bg-white shadow-sm p-6 flex flex-col transition-all relative overflow-hidden ${
        isCurrentPlan
          ? "border-emerald-400 shadow-lg shadow-emerald-100 ring-2 ring-emerald-100"
          : "border-slate-200 hover:shadow-lg hover:border-slate-300"
      }`}
    >
      {/* Popular badge */}
      {plan.id_Plan === "Plus" && !isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
            <Zap size={10} />
            Popular
          </span>
        </div>
      )}

      {/* Plan icon */}
      <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${colorMap[features.color]} flex items-center justify-center mb-4`}>
        <Icon size={24} className="text-white" />
      </div>

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

      {/* Price */}
      <div className="mb-5">
        <span className="text-3xl font-bold text-slate-900">
          {Number(plan.precioMensual) === 0
            ? "Gratis"
            : `$${Number(plan.precioMensual).toLocaleString("es-CO")}`}
        </span>
        {Number(plan.precioMensual) > 0 && (
          <span className="text-sm text-slate-500 ml-1">COP/mes</span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {features.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Payment method indicator */}
      {esPago && !isCurrentPlan && (
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-4">
          <ExternalLink size={12} />
          <span>Pago seguro simulado</span>
        </div>
      )}

      <Button
        disabled={isCurrentPlan || isUpdating}
        onClick={() => onSelect(plan.id_Plan)}
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
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PlanesUser({ onNavigate }) {
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
   * Select a plan and handle the payment flow.
   *
   * CORRECTION: Instead of using window.location.hash + reload (which caused
   * the redirect loop), we now use onNavigate("checkout") with checkout_data
   * stored in localStorage. This ensures proper SPA navigation.
   */
  const selectPlan = useCallback(async (idPlan) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showWarning("Sesión expirada", "Inicia sesión nuevamente.");
      return;
    }

    const plan = plans.find((p) => p.id_Plan === idPlan);
    const precio = Number(plan?.precioMensual ?? 0);

    // If user already has a paid plan and is switching, confirm
    if (currentPlanId && currentPlanId !== "Free" && currentPlanId !== idPlan && precio > 0) {
      const { isConfirmed } = await showConfirm(
        "¿Cambiar de plan?",
        `Actualmente tienes el plan ${currentPlanId}. ¿Deseas cambiar al plan ${plan?.nombre} por $${precio.toLocaleString("es-CO")} COP/mes?`,
        "Sí, cambiar plan"
      );
      if (!isConfirmed) return;
    }

    // Free plan: activate directly
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
          body: JSON.stringify({ id_Plan: idPlan, modalidadPago: 'virtual' }),
        });

        if (response.ok) {
          const savedUser = { ...currentUser, id_Plan: idPlan };
          localStorage.setItem("usuario", JSON.stringify(savedUser));

          showSuccess("¡Plan activado!", `El plan ${plan?.nombre} ha sido activado exitosamente.`);
          // Navigate to profile to show the updated plan
          if (onNavigate) {
            onNavigate("profile");
          } else {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("Error activating plan:", error);
        showError("Error", "No se pudo activar el plan gratuito.");
      } finally {
        setUpdatingPlanId(null);
      }
      return;
    }

    // Paid plan: go to checkout
    setUpdatingPlanId(idPlan);

    try {
      const { isConfirmed } = await Swal.fire({
        title: `Pagar Plan ${plan?.nombre}`,
        html: `
          <div class="text-center py-2">
            <p class="text-slate-600 mb-3">Serás redirigido al checkout para completar tu pago de forma segura.</p>
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
        // Store checkout data
        localStorage.setItem("checkout_data", JSON.stringify({
          tipo: "plan",
          idItem: idPlan,
          monto: precio,
          descripcion: `Plan ${plan?.nombre}`,
        }));

        // Navigate to checkout via SPA routing (NOT hash + reload)
        if (onNavigate) {
          onNavigate("checkout");
        } else {
          // Fallback: use hash + reload if onNavigate is not available
          window.location.hash = "#checkout";
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error al iniciar pago:", error);
      showError("Error", error.message || "No se pudo iniciar el proceso de pago.");
    } finally {
      setUpdatingPlanId(null);
    }
  }, [plans, currentUser, currentPlanId, onNavigate]);

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

      {/* Current Plan Banner */}
      {currentPlanId && currentPlanId !== "Free" && (
        <div className="bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <BadgeCheck className="text-white" size={24} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Plan activo: {currentPlanId}</p>
            <p className="text-emerald-100 text-xs">Tu suscripción está al día</p>
          </div>
        </div>
      )}

      {/* Payment Banner */}
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

          return (
            <PlanCard
              key={plan.id_Plan}
              plan={plan}
              isCurrentPlan={isCurrentPlan}
              isUpdating={isUpdating}
              onSelect={selectPlan}
            />
          );
        })}
      </div>

      {/* Security Note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          🔒 Esta es una simulación de pago para Manifestación. No se procesará dinero real.
        </p>
      </div>
    </div>
  );
}
