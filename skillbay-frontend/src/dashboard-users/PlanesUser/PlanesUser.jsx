import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CreditCard, Loader2 } from "lucide-react";
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

  const selectPlan = async (idPlan) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      Swal.fire("Sesion expirada", "Inicia sesion nuevamente.", "warning");
      return;
    }

    setUpdatingPlanId(idPlan);

    try {
      const response = await fetch(`${API_URL}/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id_Plan: idPlan }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "No se pudo actualizar el plan.");
      }

      const savedUser = data?.usuario ?? { ...currentUser, id_Plan: idPlan };
      localStorage.setItem("usuario", JSON.stringify(savedUser));

      Swal.fire({
        icon: "success",
        title: "Plan actualizado",
        text: `Ahora estas en el plan ${idPlan}.`,
        timer: 1800,
        showConfirmButton: false,
      }).then(() => window.location.reload());
    } catch (error) {
      console.error("Error updating plan:", error);
      Swal.fire("Error", error.message || "No se pudo actualizar el plan.", "error");
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id_Plan;
          const isUpdating = updatingPlanId === plan.id_Plan;

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
                    ${Number(plan.precioMensual).toLocaleString("es-CO")} COP
                  </span>
                </p>
              </div>

              <Button
                disabled={isCurrentPlan || isUpdating}
                onClick={() => selectPlan(plan.id_Plan)}
                className={`mt-auto rounded-xl ${
                  isCurrentPlan
                    ? "bg-emerald-600 hover:bg-emerald-600"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {isCurrentPlan ? "Plan activo" : isUpdating ? "Actualizando..." : "Seleccionar plan"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
