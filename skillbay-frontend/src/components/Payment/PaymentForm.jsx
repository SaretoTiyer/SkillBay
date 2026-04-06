import { useState } from 'react';

const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : value;
};

const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

const TarjetaForm = ({ onSubmit, loading, onBack }) => {
  const [formData, setFormData] = useState({
    numero_tarjeta: '',
    titular: '',
    fecha_vencimiento: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'numero_tarjeta') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'fecha_vencimiento') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    const cardNumber = formData.numero_tarjeta.replace(/\s/g, '');
    
    if (!cardNumber || cardNumber.length < 15) {
      newErrors.numero_tarjeta = 'Ingresa un número de tarjeta válido';
    }
    if (!formData.titular || formData.titular.length < 3) {
      newErrors.titular = 'Ingresa el nombre del titular';
    }
    if (!formData.fecha_vencimiento || formData.fecha_vencimiento.length < 5) {
      newErrors.fecha_vencimiento = 'Ingresa fecha válida (MM/AA)';
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Ingresa el CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        numero_tarjeta: formData.numero_tarjeta.replace(/\s/g, ''),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de tarjeta
        </label>
        <input
          type="text"
          name="numero_tarjeta"
          value={formData.numero_tarjeta}
          onChange={handleChange}
          placeholder="1234 5678 9012 3456"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.numero_tarjeta ? 'border-red-500' : 'border-gray-300'}`}
          maxLength={19}
        />
        {errors.numero_tarjeta && <p className="text-red-500 text-xs mt-1">{errors.numero_tarjeta}</p>}
        <p className="text-xs text-gray-500 mt-1">Prueba: 4111 1111 1111 1111 (aprueba), 4000 0000 0000 0000 (rechaza)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del titular
        </label>
        <input
          type="text"
          name="titular"
          value={formData.titular}
          onChange={handleChange}
          placeholder="Juan Perez"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.titular ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.titular && <p className="text-red-500 text-xs mt-1">{errors.titular}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de vencimiento
          </label>
          <input
            type="text"
            name="fecha_vencimiento"
            value={formData.fecha_vencimiento}
            onChange={handleChange}
            placeholder="MM/AA"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.fecha_vencimiento ? 'border-red-500' : 'border-gray-300'}`}
            maxLength={5}
          />
          {errors.fecha_vencimiento && <p className="text-red-500 text-xs mt-1">{errors.fecha_vencimiento}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            type="text"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
            placeholder="123"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
            maxLength={4}
          />
          {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Pagar ahora'}
        </button>
      </div>
    </form>
  );
};

const PSEForm = ({ onSubmit, loading, onBack }) => {
  const [formData, setFormData] = useState({
    cuenta_banco: '',
    tipo_cuenta: 'ahorros',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Selecciona tu banco
        </label>
        <select
          name="cuenta_banco"
          value={formData.cuenta_banco}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        >
          <option value="">Selecciona un banco</option>
          <option value="bancolombia">Bancolombia</option>
          <option value="davivienda">Davivienda</option>
          <option value="bogota">Banco de Bogotá</option>
          <option value="bbva">BBVA</option>
          <option value="santander">Santander</option>
          <option value="citibank">Citibank</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de cuenta
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipo_cuenta"
              value="ahorros"
              checked={formData.tipo_cuenta === 'ahorros'}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">Ahorros</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipo_cuenta"
              value="corriente"
              checked={formData.tipo_cuenta === 'corriente'}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">Corriente</span>
          </label>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          Serás redirigido a la página de tu banco para completar la transferencia.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={loading || !formData.cuenta_banco}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Redireccionando...' : 'Continuar con PSE'}
        </button>
      </div>
    </form>
  );
};

const EfectivoForm = ({ onSubmit, loading, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-yellow-800">Pago en efectivo</p>
            <p className="text-sm text-yellow-700 mt-1">
              El pago se realizará directamente con el proveedor al momento de recibir el servicio.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Confirmando...' : 'Confirmar pago en efectivo'}
        </button>
      </div>
    </form>
  );
};

const BalotoForm = ({ onSubmit, loading, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({});
  };

  const referencia = 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <p className="font-medium text-purple-800 mb-2">Referencia de pago:</p>
        <p className="text-2xl font-bold text-purple-900 tracking-wider">{referencia}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          <strong>Instrucciones:</strong>
        </p>
        <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
          <li>Acude a cualquier punto Baloto o Efecty</li>
          <li>Indica la referencia de pago: <strong>{referencia}</strong></li>
          <li>Paga el monto total shown</li>
          <li>Guarda tu comprobante</li>
        </ol>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          El pago se procesará automáticamente una vez realizado el pago en el punto.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Generar referencia'}
        </button>
      </div>
    </form>
  );
};

export default function PaymentForm({ metodo, onSubmit, loading, onBack }) {
  const forms = {
    tarjeta: TarjetaForm,
    pse: PSEForm,
    efectivo: EfectivoForm,
    baloto: BalotoForm,
  };

  const FormComponent = forms[metodo] || TarjetaForm;

  const titles = {
    tarjeta: 'Datos de tu tarjeta',
    pse: 'Información bancaria',
    efectivo: 'Pago en efectivo',
    baloto: 'Pago por Baloto',
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {titles[metodo] || 'Datos de pago'}
      </h3>
      <FormComponent onSubmit={onSubmit} loading={loading} onBack={onBack} />
    </div>
  );
}
