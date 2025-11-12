import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from '../components/ui/Label';
import logoFull from '../assets/resources/Logos/LogoSkillBay.png';

export default function Login({ onNavigate, onLogin}) {
const [showPassword, setShowPassword] = useState(false);
const [formData, setFormData] = useState({
    email: '',
    password: '',
});

const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.email || !formData.password) {
    Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor, completa todos los campos antes de continuar.',
    });
    return;
    }

    try {
    const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        id_CorreoUsuario: formData.email,
        password: formData.password,
        }),
    });

    const data = await response.json();

    if (response.ok) {
        // Guardar token o datos si tu backend los devuelve
        Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Inicio de sesión exitoso.`,
        timer: 2000,
        showConfirmButton: false,
        });

        // Ejemplo de guardado en localStorage
        localStorage.setItem('usuario', JSON.stringify(data.usuario || {}));

        onLogin();

        // Redirigir al home (o dashboard)
        onNavigate('explore');
    } else {
        Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: data.message || 'Credenciales incorrectas.',
        });
    }
    } catch (error) {
    console.error(error);
    Swal.fire({
        icon: 'error',
        title: 'Error del servidor',
        text: 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.',
    });
    }
};

const handleChange = (e) => {
    setFormData({
    ...formData,
    [e.target.name]: e.target.value,
    });
};

return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1E3A5F] via-[#2B6CB0] to-[#1E3A5F] py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="flex justify-center mb-8">
            <img src={logoFull} alt="SkillBay" className="h-16" />
        </div>

        <div className="text-center mb-8">
            <h2 className="text-[#1E3A5F] mb-2">Iniciar Sesión</h2>
            <p className="text-[#A0AEC0]">Bienvenido de nuevo a SkillBay</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                type="checkbox"
                className="rounded border-[#E2E8F0] text-[#2B6CB0] focus:ring-[#2B6CB0]"
                />
                <span className="text-[#A0AEC0]">Recordarme</span>
            </label>
            <button
                type="button"
                className="text-[#2B6CB0] hover:text-[#2563a7] transition-colors"
            >
                ¿Olvidaste tu contraseña?
            </button>
            </div>

            <Button
            type="submit"
            className="w-full bg-[#2B6CB0] hover:bg-[#2563a7] text-white py-6"
            >
            <LogIn size={18} className="mr-2" />
            Iniciar Sesión
            </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-[#A0AEC0]">o</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        <div className="mt-8 text-center">
            <p className="text-[#A0AEC0]">
            ¿No tienes una cuenta?{' '}
            <button
                onClick={() => onNavigate('register')}
                className="text-[#2B6CB0] hover:text-[#2563a7] transition-colors"
            >
                Regístrate
            </button>
            </p>
        </div>
        </div>

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
