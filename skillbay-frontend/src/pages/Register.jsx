import { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from '../components/ui/Label';
import logoFull from '../assets/resources/Logos/LogoSkillBay.png';

export default function Register({ onNavigate }) {
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'client',
    acceptTerms: false,
});

const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
    }

    if (!formData.acceptTerms) {
    alert('Debes aceptar los términos y condiciones');
    return;
    }

    // Aquí iría la lógica de registro (por ejemplo, llamada al backend)
    alert('¡Registro exitoso! Bienvenido a SkillBay');
    onNavigate('home');
};

const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
    ...formData,
    [name]: type === 'checkbox' ? checked : value,
    });
};

return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1E3A5F] via-[#2B6CB0] to-[#1E3A5F] py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
            <img src={logoFull} alt="SkillBay" className="h-16" />
        </div>

        {/* Título */}
        <div className="text-center mb-8">
            <h2 className="text-[#1E3A5F] mb-2">Crear Cuenta</h2>
            <p className="text-[#A0AEC0]">Únete a la comunidad de SkillBay</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre Completo */}
            <div>
            <Label htmlFor="fullName" className="text-[#1E3A5F]">
                Nombre Completo
            </Label>
            <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-2 border-[#E2E8F0] focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
                placeholder="Juan Pérez"
            />
            </div>

            {/* Email */}
            <div>
            <Label htmlFor="email" className="text-[#1E3A5F]">
                Correo Electrónico
            </Label>
            <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 border-[#E2E8F0] focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
                placeholder="tu@email.com"
            />
            </div>

            {/* Teléfono */}
            <div>
            <Label htmlFor="phone" className="text-[#1E3A5F]">
                Teléfono
            </Label>
            <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-2 border-[#E2E8F0] focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
                placeholder="+57 300 123 4567"
            />
            </div>

            {/* Tipo de Usuario */}
            <div>
            <Label htmlFor="userType" className="text-[#1E3A5F]">
                ¿Cómo quieres usar SkillBay?
            </Label>
            <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
                className="mt-2 w-full px-3 py-2 border border-[#E2E8F0] rounded-md focus:border-[#2B6CB0] focus:ring-[#2B6CB0] text-[#1E3A5F]"
            >
                <option value="client">Buscar servicios</option>
                <option value="provider">Ofrecer servicios</option>
                <option value="both">Ambos</option>
            </select>
            </div>

            {/* Contraseña */}
            <div>
            <Label htmlFor="password" className="text-[#1E3A5F]">
                Contraseña
            </Label>
            <div className="relative mt-2">
                <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                className="border-[#E2E8F0] focus:border-[#2B6CB0] focus:ring-[#2B6CB0] pr-10"
                placeholder="••••••••"
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

            {/* Confirmar Contraseña */}
            <div>
            <Label htmlFor="confirmPassword" className="text-[#1E3A5F]">
                Confirmar Contraseña
            </Label>
            <div className="relative mt-2">
                <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="border-[#E2E8F0] focus:border-[#2B6CB0] focus:ring-[#2B6CB0] pr-10"
                placeholder="••••••••"
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

            {/* Términos y Condiciones */}
            <div>
            <label className="flex items-start gap-2 cursor-pointer">
                <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 rounded border-[#E2E8F0] text-[#2B6CB0] focus:ring-[#2B6CB0]"
                />
                <span className="text-[#A0AEC0]">
                Acepto los{' '}
                <button type="button" className="text-[#2B6CB0] hover:text-[#2563a7]">
                    términos y condiciones
                </button>{' '}
                y la{' '}
                <button type="button" className="text-[#2B6CB0] hover:text-[#2563a7]">
                    política de privacidad
                </button>
                </span>
            </label>
            </div>

            {/* Botón de Registro */}
            <Button
            type="submit"
            className="w-full bg-[#2B6CB0] hover:bg-[#2563a7] text-white py-6 mt-6"
            >
            <UserPlus size={18} className="mr-2" />
            Crear Cuenta
            </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E2E8F0]"></div>
            <span className="text-[#A0AEC0]">o</span>
            <div className="flex-1 h-px bg-[#E2E8F0]"></div>
        </div>

        {/* Botón de Registro con Google */}
        <div className="space-y-3">
            <button
            type="button"
            className="w-full py-3 border-2 border-[#E2E8F0] rounded-lg hover:border-[#2B6CB0] hover:bg-[#E2E8F0] transition-colors text-[#1E3A5F] flex items-center justify-center gap-2"
            >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
            </svg>
            Registrarse con Google
            </button>
        </div>

        {/* Iniciar Sesión */}
        <div className="mt-6 text-center">
            <p className="text-[#A0AEC0]">
            ¿Ya tienes una cuenta?{' '}
            <button
                onClick={() => onNavigate('login')}
                className="text-[#2B6CB0] hover:text-[#2563a7] transition-colors"
            >
                Inicia Sesión
            </button>
            </p>
        </div>
        </div>

        {/* Volver al Inicio */}
        <div className="mt-6 text-center">
        <button
            onClick={() => onNavigate('home')}
            className="text-white hover:text-[#E2E8F0] transition-colors"
        >
            ← Volver al Inicio
        </button>
        </div>
    </div>
    </div>
);
}
