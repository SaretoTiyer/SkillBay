const PaymentMethodIcon = ({ tipo }) => {
  const iconos = {
    'credit-card': (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    'smartphone': (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    'qr-code': (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    'banknotes': (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  };

  return iconos[tipo] || iconos['credit-card'];
};

export default function PaymentMethodSelector({ methods, selected, onSelect, disabled }) {
  const digitalMethods = methods.filter(m => m.categoria === 'digital');
  const efectivoMethods = methods.filter(m => m.categoria === 'efectivo');

  const handleKeyDown = (e, methodId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(methodId);
    }
  };

  return (
    <div className="space-y-6">
      {digitalMethods.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pago Digital
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {digitalMethods.map((metodo) => (
              <button
                key={metodo.id}
                onClick={() => onSelect(metodo.id)}
                onKeyDown={(e) => handleKeyDown(e, metodo.id)}
                disabled={disabled}
                aria-pressed={selected === metodo.id}
                className={`
                  flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200
                  ${selected === metodo.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                `}
              >
                <div className={`${selected === metodo.id ? 'text-blue-600' : 'text-gray-500'}`}>
                  <PaymentMethodIcon tipo={metodo.icono} />
                </div>
                
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">{metodo.nombre}</p>
                  <p className="text-sm text-gray-500 mt-1">{metodo.descripcion}</p>
                </div>
                
                {selected === metodo.id && (
                  <div className="text-blue-500" aria-hidden="true">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {efectivoMethods.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Efectivo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {efectivoMethods.map((metodo) => (
              <button
                key={metodo.id}
                onClick={() => onSelect(metodo.id)}
                onKeyDown={(e) => handleKeyDown(e, metodo.id)}
                disabled={disabled}
                aria-pressed={selected === metodo.id}
                className={`
                  flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200
                  ${selected === metodo.id 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
                `}
              >
                <div className={`${selected === metodo.id ? 'text-green-600' : 'text-gray-500'}`}>
                  <PaymentMethodIcon tipo={metodo.icono} />
                </div>
                
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">{metodo.nombre}</p>
                  <p className="text-sm text-gray-500 mt-1">{metodo.descripcion}</p>
                </div>
                
                {selected === metodo.id && (
                  <div className="text-green-500" aria-hidden="true">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
