export default function PaymentStatus({ estado, monto, referencia, descripcion, onRetry, onDone }) {
  const statusConfig = {
    Completado: {
      icon: (
        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '¡Pago exitoso!',
      message: 'Tu pago ha sido procesado correctamente.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      buttonText: 'Continuar',
      showRetry: false,
    },
    Pendiente: {
      icon: (
        <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Pago pendiente',
      message: 'Tu pago está siendo procesado. Te notificaremos cuando sea aprobado.',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonText: 'Ver estado',
      showRetry: false,
    },
    Fallido: {
      icon: (
        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Pago fallido',
      message: 'Hubo un problema al procesar tu pago. Por favor intenta de nuevo.',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonText: 'Intentar de nuevo',
      showRetry: true,
    },
  };

  const config = statusConfig[estado] || statusConfig.Fallido;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-8 max-w-md w-full text-center`}>
        <div className="flex justify-center mb-4">
          {config.icon}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {config.title}
        </h2>

        <p className="text-gray-600 mb-6">
          {config.message}
        </p>

        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="space-y-2 text-sm">
            {descripcion && (
              <div className="flex justify-between">
                <span className="text-gray-500">Descripción:</span>
                <span className="font-medium text-gray-900">{descripcion}</span>
              </div>
            )}
            {monto && (
              <div className="flex justify-between">
                <span className="text-gray-500">Monto:</span>
                <span className="font-bold text-gray-900">{formatCurrency(monto)}</span>
              </div>
            )}
            {referencia && (
              <div className="flex justify-between">
                <span className="text-gray-500">Referencia:</span>
                <span className="font-mono text-gray-900">{referencia}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {config.showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              {config.buttonText}
            </button>
          )}
          <button
            onClick={onDone}
            className={`${config.showRetry ? 'flex-1' : 'w-full'} px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition`}
          >
            {config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
