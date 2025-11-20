    import { useState, useMemo } from 'react';
    import { Eye, EyeOff, UserPlus, Phone } from 'lucide-react';
    import Swal from 'sweetalert2';
    import { API_URL } from '../config/api';
    import logoFull from '../assets/resources/Logos/LogoSkillBay.png';

    export default function Register({ onNavigate }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        id_CorreoUsuario: '',
        telefono: '',
        genero: '',
        ciudad: '',
        departamento: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });

    const [errors, setErrors] = useState({});

    // Validaciones regex (seguras para Vite)
    const passwordRegex = useMemo(
        () =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,15}$/,
        []
    );

    // Prohibimos caracteres peligrosos en campos de texto (no incluye espacio)
    // NOTA: guión y demás no están aquí porque permitimos espacios y letras.
    const forbiddenCharsRegex = /^[^'"`;=<>\/\*]+$/;

    // Campos que permiten espacios internos: nombre, apellido, ciudad, departamento
    const allowSpacesFields = new Set(['nombre', 'apellido', 'ciudad', 'departamento']);

    // Sanitizar entrada según campo:
    // - Si campo permite espacios: trim inicio/fin, eliminar chars peligrosos
    // - Si NO permite espacios (email, telefono, password, confirmPassword): quitar espacios por completo y chars peligrosos
    const sanitize = (name, value) => {
        if (value == null) return '';
        // Normalizar como string
        let s = String(value);

        // Siempre eliminar caracteres de control invisibles
        s = s.replace(/[\u0000-\u001F\u007F]/g, '');

        // Si campo permite espacios internos: trim y eliminar chars peligrosos
        if (allowSpacesFields.has(name)) {
        s = s.trim();
        // eliminar caracteres peligrosos que definimos
        s = s.replace(/['"`;=<>\/\*]/g, '');
        return s;
        }

        // Para campos que NO permiten espacios: eliminar todos los espacios
        s = s.replace(/\s+/g, '');
        s = s.replace(/['"`;=<>\/\*]/g, '');
        return s;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : sanitize(name, value);
        setFormData((prev) => ({ ...prev, [name]: val }));
        // limpiar error del campo en cambio
        setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
        });
    };

    // Checklist visual para la contraseña (opción 1 - lista minimalista)
    const passwordChecks = useMemo(() => {
        const pwd = formData.password;
        return {
        length: pwd.length >= 8 && pwd.length <= 15,
        lowercase: /[a-z]/.test(pwd),
        uppercase: /[A-Z]/.test(pwd),
        number: /[0-9]/.test(pwd),
        special: /[@$!%*?&#]/.test(pwd),
        };
    }, [formData.password]);

    const validate = () => {
        const newErrors = {};

        // Todos obligatorios
        const required = [
        'nombre',
        'apellido',
        'id_CorreoUsuario',
        'telefono',
        'genero',
        'ciudad',
        'departamento',
        'password',
        'confirmPassword',
        ];

        required.forEach((key) => {
        if (
            formData[key] === undefined ||
            formData[key] === null ||
            String(formData[key]).trim() === '' ||
            (typeof formData[key] === 'boolean' && formData[key] === false && key === 'acceptTerms')
        ) {
            newErrors[key] = 'Este campo es obligatorio';
        }
        });

        // Email: no espacios (ya sanitizamos) y formato básico
        if (formData.id_CorreoUsuario) {
        const email = formData.id_CorreoUsuario.toLowerCase();
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) newErrors.id_CorreoUsuario = 'Debe ser un correo válido';
        if (!/^\S+$/.test(formData.id_CorreoUsuario)) newErrors.id_CorreoUsuario = 'El correo no puede contener espacios';
        // longitud
        if (formData.id_CorreoUsuario.length > 191) newErrors.id_CorreoUsuario = 'El correo no puede superar 191 caracteres';
        }

        // Nombre / Apellido / Ciudad / Departamento: no permitir chars peligrosos
        ['nombre', 'apellido', 'ciudad', 'departamento'].forEach((f) => {
        if (formData[f] && !forbiddenCharsRegex.test(formData[f])) {
            newErrors[f] = 'No se permiten caracteres especiales peligrosos';
        }
        // además no permitir más de 100 chars en nombre/apellido
        if ((f === 'nombre' || f === 'apellido') && formData[f]) {
            if (formData[f].length < 2 || formData[f].length > 100) {
            newErrors[f] = 'Debe tener entre 2 y 100 caracteres';
            }
        }
        if ((f === 'ciudad' || f === 'departamento') && formData[f]) {
            if (formData[f].length > 100) newErrors[f] = 'No puede exceder 100 caracteres';
        }
        });

        // Teléfono: permitimos dígitos, +, -, espacios internos (pero sanitized removed outer spaces)
        if (formData.telefono) {
        if (!/^[0-9+\-\s]{7,20}$/.test(formData.telefono)) {
            newErrors.telefono = 'Teléfono inválido (solo números, +, -, espacios — 7 a 20 caracteres)';
        }
        }

        // Password: validaciones robustas
        if (formData.password) {
        if (!passwordRegex.test(formData.password)) {
            newErrors.password =
            'La contraseña debe tener 8-15 caracteres, incluir mayúscula, minúscula, número y símbolo (@$!%*?&#) y no contener espacios';
        }
        }

        // Confirm password
        if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        // accept terms (es un campo booleano)
        if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // re-sanitize email to be safe & lowercase
        setFormData((prev) => ({ ...prev, id_CorreoUsuario: (prev.id_CorreoUsuario || '').toLowerCase() }));

        if (!validate()) return;

        try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            id_CorreoUsuario: formData.id_CorreoUsuario,
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            genero: formData.genero || null,
            ciudad: formData.ciudad || null,
            departamento: formData.departamento || null,
            password: formData.password,
            }),
        });

        // Si el backend devuelve HTML (redirect/302) el json() podría fallar — manejarlo
        const contentType = response.headers.get('content-type') || '';
        let data = {};
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // respuesta inesperada: leer texto para mostrar algo útil
            const text = await response.text();
            data = { message: text || 'Respuesta no JSON del servidor' };
        }

        if (response.ok) {
            Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: '¡Bienvenido a SkillBay!',
            confirmButtonColor: '#2563eb',
            }).then(() => onNavigate && onNavigate('login'));
        } else {
            // Mostrar errores de validación del backend si vienen
            if (data && data.errors) {
            const messages = Object.values(data.errors).flat().join('\n');
            Swal.fire('Error', messages, 'error');
            } else {
            Swal.fire('Error', data.message || 'No se pudo completar el registro', 'error');
            }
        }
        } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Error de conexión con el servidor', 'error');
        }
    };

    const renderError = (field) =>
        errors[field] ? <p className="text-red-600 text-sm mt-1">{errors[field]}</p> : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1E3A5F] via-[#2B6CB0] to-[#1E3A5F] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="flex justify-center mb-8">
            <img src={logoFull} alt="SkillBay" className="h-16" />
            </div>

            <div className="text-center mb-8">
            <h2 className="text-[#1E3A5F] mb-2">Crear Cuenta</h2>
            <p className="text-[#A0AEC0]">Únete a la comunidad de SkillBay</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Nombre */}
            <div>
                <label className="block text-[#1E3A5F]">Nombre</label>
                <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
                className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2"
                placeholder="Juan"
                />
                {renderError('nombre')}
            </div>

            {/* Apellido */}
            <div>
                <label className="block text-[#1E3A5F]">Apellido</label>
                <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
                className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2"
                placeholder="Pérez"
                />
                {renderError('apellido')}
            </div>

            {/* Email */}
            <div>
                <label className="block text-[#1E3A5F]">Correo electrónico</label>
                <input
                type="email"
                name="id_CorreoUsuario"
                value={formData.id_CorreoUsuario}
                onChange={handleChange}
                required
                maxLength={191}
                className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2"
                placeholder="correo@ejemplo.com"
                />
                {renderError('id_CorreoUsuario')}
            </div>

            {/* Teléfono */}
            <div>
                <label className="block text-[#1E3A5F]">Teléfono</label>
                <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" size={18} />
                <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    pattern="[0-9+\-\s]{7,20}"
                    className="pl-10 w-full border border-[#E2E8F0] rounded-md px-3 py-2"
                    placeholder="3001234567"
                />
                </div>
                {renderError('telefono')}
            </div>

            {/* Género */}
            <div>
                <label className="block text-[#1E3A5F]">Género</label>
                <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
                className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2"
                >
                <option value="">Selecciona tu género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                </select>
                {renderError('genero')}
            </div>

            {/* Departamento y ciudad */}
            <div className="flex gap-3">
                <div className="w-1/2">
                <label className="block text-[#1E3A5F]">Departamento</label>
                <input
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2"
                    placeholder="Cundinamarca"
                />
                {renderError('departamento')}
                </div>
                <div className="w-1/2">
                <label className="block text-[#1E3A5F]">Ciudad</label>
                <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2"
                    placeholder="Bogotá"
                />
                {renderError('ciudad')}
                </div>
            </div>

            {/* Contraseña */}
            <div>
                <label className="block text-[#1E3A5F]">Contraseña</label>
                <div className="relative mt-2">
                <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    maxLength={15}
                    className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                </div>

                {/* Checklist dinámico */}
                <div className="mt-3 text-sm space-y-1">
                <div className={passwordChecks.length ? 'text-green-600' : 'text-red-600'}>
                    {passwordChecks.length ? '✓' : '✗'} 8–15 caracteres
                </div>
                <div className={passwordChecks.lowercase ? 'text-green-600' : 'text-red-600'}>
                    {passwordChecks.lowercase ? '✓' : '✗'} Al menos una minúscula
                </div>
                <div className={passwordChecks.uppercase ? 'text-green-600' : 'text-red-600'}>
                    {passwordChecks.uppercase ? '✓' : '✗'} Al menos una mayúscula
                </div>
                <div className={passwordChecks.number ? 'text-green-600' : 'text-red-600'}>
                    {passwordChecks.number ? '✓' : '✗'} Al menos un número
                </div>
                <div className={passwordChecks.special ? 'text-green-600' : 'text-red-600'}>
                    {passwordChecks.special ? '✓' : '✗'} Al menos un carácter especial (@$!%*?&#)
                </div>
                </div>

                {renderError('password')}
            </div>

            {/* Confirmar contraseña */}
            <div>
                <label className="block text-[#1E3A5F]">Confirmar contraseña</label>
                <div className="relative mt-2">
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    maxLength={15}
                    className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]"
                >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                </div>
                {renderError('confirmPassword')}
            </div>

            {/* Términos */}
            <div className="flex items-center gap-2">
                <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="rounded text-[#2B6CB0]"
                />
                <span className="text-[#A0AEC0] text-sm">
                Acepto los{' '}
                <button type="button" className="text-[#2B6CB0] hover:underline">
                    términos y condiciones
                </button>
                </span>
            </div>
            {renderError('acceptTerms')}

            {/* Botón */}
            <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2B6CB0] text-white py-3 rounded-lg hover:bg-[#2563a7]"
            >
                <UserPlus size={18} />
                Crear Cuenta
            </button>
            </form>

            <div className="mt-6 text-center">
            <p className="text-[#A0AEC0]">
                ¿Ya tienes una cuenta?{' '}
                <button onClick={() => onNavigate && onNavigate('login')} className="text-[#2B6CB0] hover:text-[#2563a7]">
                Inicia Sesión
                </button>
            </p>
            </div>
        </div>
        </div>
    );
    }
