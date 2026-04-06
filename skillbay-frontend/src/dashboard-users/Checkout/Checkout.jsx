import { useState, useEffect } from 'react';
import { PaymentMethodSelector, PaymentForm, PaymentStatus } from '../../components/Payment';
import { showSuccess, showError } from '../../utils/swalHelpers';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { API_URL } from '../../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error('No auth token found');
    return null;
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

function ProcessingOverlay({ message = 'Procesando pago...' }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-700 font-medium">{message}</p>
        <p className="text-sm text-gray-500 text-center">
          Por favor espera mientras procesamos tu pago
        </p>
      </div>
    </div>
  );
}

export default function Checkout({ 
  tipo, 
  idItem, 
  monto, 
  descripcion,
  onNavigate, 
  onComplete 
}) {
  const [step, setStep] = useState('method');
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [idPago, setIdPago] = useState(null);
  const [error, setError] = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [uploadingComprobante, setUploadingComprobante] = useState(false);
  const [comprobanteUploaded, setComprobanteUploaded] = useState(false);

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError('No estás autenticado. Por favor inicia sesión.');
      return;
    }
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    try {
      const response = await fetch(`${API_URL}/pagos/metodos`, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener métodos de pago');
      }
      
      if (data.success) {
        setMethods(data.data);
      }
    } catch (error) {
      console.error('Error fetching methods:', error);
      setError(error.message);
    }
  };

  const iniciarPago = async (metodo) => {
    const headers = getAuthHeaders();
    if (!headers) {
      showError('Error', 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const endpoint = tipo === 'plan' 
        ? `${API_URL}/pagos/plan/simulado`
        : `${API_URL}/pagos/servicio/simulado`;

      const body = tipo === 'plan'
        ? { id_plan: idItem, metodo }
        : { 
            id_postulacion: idItem, 
            metodo, 
            modalidad_servicio: 'virtual' 
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error del servidor: ${response.status}`);
      }
      
      if (data.success) {
        setIdPago(data.data.id_pago);
        setStep('form');
      } else {
        setResult({
          estado: 'Fallido',
          mensaje: data.message || 'Error al iniciar el pago',
        });
        setStep('result');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setResult({
        estado: 'Fallido',
        mensaje: error.message || 'Error de conexión. Intenta de nuevo.',
      });
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const procesarPago = async (datosPago = {}) => {
    const headers = getAuthHeaders();
    if (!headers) {
      showError('Error', 'Tu sesión ha expirado.');
      return;
    }

    setStep('processing');
    setProcessing(true);

    try {
      const response = await fetch(`${API_URL}/pagos/procesar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id_pago: idPago,
          tipo,
          datos_pago: datosPago,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar pago');
      }

      setResult({
        estado: data.data.estado,
        mensaje: data.data.mensaje,
        referencia: data.data.referencia,
      });
      setStep('result');
    } catch (error) {
      console.error('Error processing payment:', error);
      setResult({
        estado: 'Fallido',
        mensaje: error.message || 'Error de conexión. Intenta de nuevo.',
      });
      setStep('result');
    } finally {
      setProcessing(false);
    }
  };

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    iniciarPago(methodId);
  };

  const handleFormBack = () => {
    setStep('method');
    setSelectedMethod(null);
    setIdPago(null);
  };

  const handleRetry = () => {
    setStep('method');
    setSelectedMethod(null);
    setIdPago(null);
    setResult(null);
    setComprobante(null);
    setComprobanteUploaded(false);
  };

  const uploadComprobante = async () => {
    if (!comprobante || !idPago) return;
    
    setUploadingComprobante(true);
    const headers = getAuthHeaders();
    if (!headers) {
      showError('Error', 'Tu sesión ha expirado.');
      setUploadingComprobante(false);
      return;
    }

    const formData = new FormData();
    formData.append('id_pago', idPago);
    formData.append('comprobante', comprobante);

    try {
      const response = await fetch(`${API_URL}/pagos/comprobante`, {
        method: 'POST',
        headers: {
          'Authorization': headers.Authorization,
        },
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al subir comprobante');
      }
      
      setComprobanteUploaded(true);
      showSuccess('Éxito', 'Comprobante subido correctamente');
    } catch (error) {
      console.error('Error uploading comprobante:', error);
      showError('Error', error.message || 'No se pudo subir el comprobante');
    } finally {
      setUploadingComprobante(false);
    }
  };

  const isDigitalPayment = selectedMethod === 'tarjeta' || selectedMethod === 'nequi' || selectedMethod === 'bancolombia_qr';

  const handleDone = async () => {
    const headers = getAuthHeaders();
    
    if (result?.estado === 'Completado' && tipo === 'plan' && headers) {
      try {
        const response = await fetch(`${API_URL}/user`, { headers });
        const data = await response.json();
        if (data?.usuario) {
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }
        // Clear checkout data and navigate to profile with success
        localStorage.removeItem('checkout_data');
        if (onNavigate) {
          onNavigate('profile');
        } else {
          window.location.reload();
        }
        return;
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }

    if (onComplete) {
      onComplete(result);
    } else if (onNavigate) {
      onNavigate('payments');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => onNavigate ? onNavigate('payments') : window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const currentMethod = methods.find(m => m.id === selectedMethod);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-xl font-bold text-white">Checkout de Pago</h1>
            <p className="text-blue-100 text-sm mt-1">SkillBay - Pago seguro simulado</p>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${step === 'method' ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'method' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                  {step === 'method' ? '1' : '✓'}
                </div>
                <span className="ml-2 text-sm font-medium">Método</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200">
                <div className={`h-1 ${step !== 'method' ? 'bg-green-500' : 'bg-gray-200'}`} />
              </div>
              <div className={`flex items-center ${step === 'form' ? 'text-blue-600' : step === 'result' || step === 'processing' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'form' ? 'bg-blue-100 text-blue-600' : step === 'result' || step === 'processing' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {step === 'form' ? '2' : step === 'result' || step === 'processing' ? '✓' : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">Datos</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200">
                <div className={`h-1 ${step === 'result' || step === 'processing' ? 'bg-green-500' : 'bg-gray-200'}`} />
              </div>
              <div className={`flex items-center ${step === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'result' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Listo</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total a pagar</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monto)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{descripcion}</p>
                <p className="text-sm font-medium text-gray-700 capitalize">{tipo === 'plan' ? 'Plan de suscripción' : 'Pago de servicio'}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 'method' && (
              <PaymentMethodSelector
                methods={methods}
                selected={selectedMethod}
                onSelect={handleMethodSelect}
                disabled={loading}
              />
            )}

            {step === 'form' && currentMethod && (
              <PaymentForm
                metodo={selectedMethod}
                onSubmit={procesarPago}
                loading={loading}
                onBack={handleFormBack}
              />
            )}

            {step === 'result' && result && (
              <>
                <PaymentStatus
                  estado={result.estado}
                  monto={monto}
                  referencia={result.referencia}
                  descripcion={descripcion}
                  onRetry={handleRetry}
                  onDone={handleDone}
                />
                
                {result.estado === 'Completado' && isDigitalPayment && tipo === 'servicio' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900">Subir comprobante de pago</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Sube una imagen o PDF del comprobante de tu transferencia para que el ofertante pueda verificar el pago.
                        </p>
                        
                        {!comprobanteUploaded ? (
                          <div className="mt-3">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => setComprobante(e.target.files[0])}
                              className="hidden"
                              id="comprobante-upload"
                            />
                            <label
                              htmlFor="comprobante-upload"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                              <Upload size={16} />
                              {comprobante ? comprobante.name : 'Seleccionar archivo'}
                            </label>
                            
                            {comprobante && (
                              <button
                                onClick={uploadComprobante}
                                disabled={uploadingComprobante}
                                className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {uploadingComprobante ? 'Subiendo...' : 'Subir comprobante'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center gap-2 text-green-700">
                            <CheckCircle size={18} />
                            <span className="font-medium">Comprobante subido correctamente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Pago simulado para Manifestación  - No se procesará dinero real</span>
        </div>
      </div>

      {processing && <ProcessingOverlay />}
    </div>
  );
}
