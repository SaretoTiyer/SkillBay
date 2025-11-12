import { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api';
import logoFull from '../assets/resources/Logos/LogoSkillBay.png';

export default function Register({ onNavigate }) {
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    genero: '',
    ubicacion: '',
    rol: 'ofertante',
    acceptTerms: false,
});

const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
    ...formData,
    [name]: type === 'checkbox' ? checked : value,
    });
};

const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones simples
    if (!formData.acceptTerms) {
    Swal.fire('Atención', 'Debes aceptar los términos y condiciones', 'warning');
    return;
    }

    if (formData.password !== formData.confirmPassword) {
    Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
    return;
    }

    //  Enviar al backend
    try {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        id_CorreoUsuario: formData.email,
        nombre: formData.nombre,
        genero: formData.genero,
        ubicacion: formData.ubicacion,
        password: formData.password,
        rol: formData.rol,
        }),
    });

    const data = await response.json();

    if (response.ok) {
        Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: '¡Bienvenido a SkillBay!',
        confirmButtonColor: '#2563eb',
        }).then(() => onNavigate('login'));
    } else {
        Swal.fire('Error', data.message || 'No se pudo completar el registro', 'error');
    }
    } catch (error) {
    Swal.fire('Error', 'Error de conexión con el servidor', 'error');
    console.error(error);
    }
};

return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1E3A5F] via-[#2B6CB0] to-[#1E3A5F] py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
        <img src={logoFull} alt="SkillBay" className="h-16" />
        </div>

        <div className="text-center mb-8">
        <h2 className="text-[#1E3A5F] mb-2">Crear Cuenta</h2>
        <p className="text-[#A0AEC0]">Únete a la comunidad de SkillBay</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
            <label className="block text-[#1E3A5F]">Nombre completo</label>
            <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
            placeholder="Juan Pérez"
            />
        </div>

        {/* Email */}
        <div>
            <label className="block text-[#1E3A5F]">Correo electrónico</label>
            <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
            placeholder="correo@ejemplo.com"
            />
        </div>

        {/* Género */}
        <div>
            <label className="block text-[#1E3A5F]">Género</label>
            <select
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            required
            className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
            >
            <option value="">Selecciona tu género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
            </select>
        </div>

        {/* Ubicación */}
        <div>
            <label className="block text-[#1E3A5F]">Ubicación</label>
            <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            required
            className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
            placeholder="Ciudad / Departamento"
            />
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
                className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 pr-10 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#2B6CB0]"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            </div>
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
                className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 pr-10 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
            />
            <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#2B6CB0]"
            >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            </div>
        </div>

        {/* Términos */}
        <div className="flex items-center gap-2">
            <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="rounded text-[#2B6CB0] focus:ring-[#2B6CB0]"
            />
            <span className="text-[#A0AEC0] text-sm">
            Acepto los{' '}
            <button type="button" className="text-[#2B6CB0] hover:underline">
                términos y condiciones
            </button>
            </span>
        </div>

        {/* Botón */}
        <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#2B6CB0] text-white py-3 rounded-lg hover:bg-[#2563a7] transition"
        >
            <UserPlus size={18} />
            Crear Cuenta
        </button>
        </form>

        <div className="mt-6 text-center">
        <p className="text-[#A0AEC0]">
            ¿Ya tienes una cuenta?{' '}
            <button
            onClick={() => onNavigate('login')}
            className="text-[#2B6CB0] hover:text-[#2563a7]"
            >
            Inicia Sesión
            </button>
        </p>
        </div>
    </div>
    </div>
);
}
