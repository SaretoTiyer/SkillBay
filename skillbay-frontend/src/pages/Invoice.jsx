import { useEffect, useState } from "react";
import { Printer, ArrowLeft, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { API_URL } from "../config/api";

const METODO_LABELS = {
  tarjeta: "Tarjeta de Crédito/Débito",
  pse: "PSE",
  efectivo: "Efectivo",
  nequi: "Nequi",
  bancolombia_qr: "QR Bancolombia",
  "Pasarela Simulada": "Pasarela Simulada",
};

const ESTADO_CONFIG = {
  Completado: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  Pendiente: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  Rechazado: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  Fallido: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  Reembolsado: { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(amount || 0);
}

export default function Invoice() {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("invoice_data");
      if (!stored) {
        setError("No se encontró información de la factura.");
        setLoading(false);
        return;
      }
      const data = JSON.parse(stored);
      setInvoiceData(data);
      setLoading(false);
    } catch (err) {
      setError("Error al cargar los datos de la factura.");
      setLoading(false);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center shadow-sm">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar la factura</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    );
  }

  const { tipo, pago } = invoiceData || {};
  const estadoCfg = ESTADO_CONFIG[pago?.estado] || ESTADO_CONFIG.Pendiente;
  const EstadoIcon = estadoCfg.icon;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar - hidden when printing */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between print:hidden">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Printer size={16} /> Imprimir
        </button>
      </div>

      {/* Invoice content */}
      <div className="max-w-3xl mx-auto p-6 lg:p-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-0 print:rounded-none">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white print:from-gray-800 print:to-gray-900 print:bg-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">SkillBay</h1>
                <p className="text-blue-100 text-sm mt-1">Comprobante de Pago</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${estadoCfg.bg} ${estadoCfg.color} print:bg-gray-700 print:text-white`}>
                  <EstadoIcon size={14} />
                  {pago?.estado || "Pendiente"}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-6">

            {/* Invoice info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Referencia</p>
                <p className="font-mono text-sm font-semibold text-gray-900 mt-1">{pago?.referenciaPago || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de pago</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(pago?.fechaPago)}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Payment details based on type */}
            {tipo === "plan" ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">P</span>
                  </span>
                  Detalles del Plan
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Plan</span>
                    <span className="text-sm font-medium text-gray-900">{pago?.plan?.nombre || "—"}</span>
                  </div>
                  {pago?.fechaInicioPlan && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Inicio</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(pago.fechaInicioPlan)}</span>
                    </div>
                  )}
                  {pago?.fechaFinPlan && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Vencimiento</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(pago.fechaFinPlan)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Método de pago</span>
                    <span className="text-sm font-medium text-gray-900">{METODO_LABELS[pago?.metodoPago] || pago?.metodoPago || "—"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                    <span className="text-green-600 text-xs font-bold">S</span>
                  </span>
                  Detalles del Servicio
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Servicio</span>
                    <span className="text-sm font-medium text-gray-900">{pago?.servicio?.titulo || "—"}</span>
                  </div>
                  {pago?.pagador && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Pagador</span>
                      <span className="text-sm font-medium text-gray-900">
                        {pago.pagador.nombre} {pago.pagador.apellido}
                      </span>
                    </div>
                  )}
                  {pago?.receptor && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Receptor</span>
                      <span className="text-sm font-medium text-gray-900">
                        {pago.receptor.nombre} {pago.receptor.apellido}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Modalidad</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{pago?.modalidadPago || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Método de pago</span>
                    <span className="text-sm font-medium text-gray-900">{METODO_LABELS[pago?.metodoPago] || pago?.metodoPago || "—"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Total */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 print:bg-gray-100 print:border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium print:text-gray-600">Total pagado</p>
                  <p className="text-3xl font-bold text-blue-800 mt-1 print:text-gray-900">
                    {formatCurrency(pago?.monto)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-500 print:text-gray-500">Tipo de pago</p>
                  <p className="text-sm font-semibold text-blue-700 capitalize print:text-gray-700">
                    {tipo === "plan" ? "Suscripción" : "Servicio"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="text-center py-4">
              <p className="text-xs text-gray-400">
                Este comprobante es generado automáticamente por SkillBay.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Fecha de emisión: {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
