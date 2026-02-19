import { useEffect, useMemo, useState } from "react";
import { CreditCard, Landmark, Loader2, ReceiptText } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../config/api";

export default function UserPayments() {
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [history, setHistory] = useState({ pagos_plan: [], pagos_servicio: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/pagos/plan`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(planForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "No se pudo procesar el pago del plan.");

      const updatedUser = { ...currentUser, id_Plan: planForm.id_Plan };
      localStorage.setItem("usuario", JSON.stringify(updatedUser));

      Swal.fire("Pago aprobado", `Plan actualizado. Referencia: ${data?.pago?.referenciaPago || "-"}`, "success");
      await loadData();
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

      Swal.fire("Pago registrado", `Referencia: ${data?.pago?.referenciaPago || "-"}`, "success");
      await loadData();
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo registrar el pago.", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Pagos Simulados</h1>
        <p className="text-slate-500">Gestiona pagos de plan y pagos de servicio en flujos separados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={submitPlanPayment} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <CreditCard size={20} /> Pago de Plan (solo virtual)
          </h2>
          <p className="text-sm text-slate-500">Plan actual: <span className="font-semibold text-slate-700">{currentPlanId || "Sin plan"}</span></p>

          <div>
            <label className="text-sm text-slate-600">Plan a pagar</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
              value={planForm.id_Plan}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, id_Plan: e.target.value }))}
            >
              {plans.map((plan) => (
                <option key={plan.id_Plan} value={plan.id_Plan}>
                  {plan.nombre} - ${Number(plan.precioMensual || 0).toLocaleString("es-CO")} COP
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Modalidad de pago</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-slate-100" value="virtual" readOnly />
          </div>

          <button disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
            {processing ? "Procesando..." : "Pagar plan"}
          </button>
        </form>

        <form onSubmit={submitServicePayment} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Landmark size={20} /> Pago de Servicio
          </h2>

          <div>
            <label className="text-sm text-slate-600">Servicio</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
              value={serviceForm.id_Servicio}
              onChange={(e) => setServiceForm((prev) => ({ ...prev, id_Servicio: e.target.value }))}
            >
              {services.map((service) => (
                <option key={service.id_Servicio} value={service.id_Servicio}>
                  {service.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">Modalidad de pago</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
                value={serviceForm.modalidadPago}
                onChange={(e) => setServiceForm((prev) => ({ ...prev, modalidadPago: e.target.value }))}
              >
                <option value="virtual">Virtual</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Modalidad del servicio</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
                value={serviceForm.modalidadServicio}
                onChange={(e) => setServiceForm((prev) => ({ ...prev, modalidadServicio: e.target.value }))}
              >
                <option value="virtual">Virtual</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">Origen</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
                value={serviceForm.origenSolicitud}
                onChange={(e) => setServiceForm((prev) => ({ ...prev, origenSolicitud: e.target.value }))}
              >
                <option value="servicio">Solicitud de servicio</option>
                <option value="postulacion">Postulacion (oportunidad)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">ID postulacion (opcional)</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
                value={serviceForm.id_Postulacion}
                onChange={(e) => setServiceForm((prev) => ({ ...prev, id_Postulacion: e.target.value }))}
                placeholder="Ej: 15"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Identificacion del cliente</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
              value={serviceForm.identificacionCliente}
              onChange={(e) => setServiceForm((prev) => ({ ...prev, identificacionCliente: e.target.value }))}
              placeholder="CC/NIT/Pasaporte"
            />
          </div>

          <button disabled={processing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">
            {processing ? "Procesando..." : "Registrar pago de servicio"}
          </button>
        </form>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <ReceiptText size={20} /> Historial de pagos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Pagos de plan</h3>
            {history.pagos_plan?.length ? (
              <div className="space-y-2">
                {history.pagos_plan.map((item) => (
                  <div key={item.id_PagoPlan} className="border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
                    {item?.plan?.nombre || item.id_Plan} - ${Number(item.monto).toLocaleString("es-CO")} COP - {item.referenciaPago || "-"}
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-500">Sin pagos de plan.</p>}
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Pagos de servicio</h3>
            {history.pagos_servicio?.length ? (
              <div className="space-y-2">
                {history.pagos_servicio.map((item) => (
                  <div key={item.id_PagoServicio} className="border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
                    {item?.servicio?.titulo || `Servicio ${item.id_Servicio}`} - ${Number(item.monto).toLocaleString("es-CO")} COP - {item.referenciaPago || "-"}
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-500">Sin pagos de servicio.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
