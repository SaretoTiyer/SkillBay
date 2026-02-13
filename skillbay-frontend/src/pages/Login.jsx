import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api';
import logoFull from '../assets/IconoSkillBay.png';
import Loader from '../components/Loader';

export default function Login({ onNavigate, onLogin }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        id_CorreoUsuario: '',
        password: '',
    });

    // -------- SANITIZACIÓN SEGURA (igual que Register.jsx) ----------
    const sanitize = (name, value) => {
        if (value == null) return '';
        let s = String(value);

        // Quitar caracteres invisibles
        s = s.replace(/[\u0000-\u001F\u007F]/g, '');

        // Quitar caracteres peligrosos
        s = s.replace(/['"`;=<>\/\*]/g, '');

        // Email y password NO permiten espacios
        if (name === 'id_CorreoUsuario' || name === 'password') {
            s = s.replace(/\s+/g, '');
        }

        return s;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const cleaned = sanitize(name, value);
        setFormData((prev) => ({ ...prev, [name]: cleaned }));
    };

    // -------- VALIDACIÓN ----------
    const validate = () => {
        if (!formData.id_CorreoUsuario.trim() || !formData.password.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos vacíos',
                text: 'Por favor, completa todos los campos antes de continuar.',
            });
            return false;
        }

        // Email válido
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.id_CorreoUsuario);
        if (!emailOk) {
            Swal.fire({
                icon: 'error',
                title: 'Correo inválido',
                text: 'Ingresa un correo electrónico válido.',
            });
            return false;
        }

        // Password mínimo
        if (formData.password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña inválida',
                text: 'La contraseña debe tener mínimo 8 caracteres.',
            });
            return false;
        }

        return true;
    };

    // -------- SUBMIT ----------
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_CorreoUsuario: formData.id_CorreoUsuario.toLowerCase(),
                    password: formData.password,
                }),
            });

            const contentType = response.headers.get('content-type') || '';
            let data = {};

            // Si backend devuelve JSON → leer normal
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Si backend devuelve HTML → error (ej. redirección Laravel)
                const text = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: text || 'Respuesta no válida del servidor.',
                });
                return;
            }

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Bienvenido',
                    text: 'Inicio de sesión exitoso',
                    timer: 1500,
                    showConfirmButton: false,
                });

                // Guardar usuario y token
                localStorage.setItem('usuario', JSON.stringify(data.usuario || {}));
                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                }

                // Callback global
                onLogin && onLogin(data);

                // Redirige segun rol
                const nextView = data?.usuario?.rol === 'admin' ? 'admin_overview' : 'explore';
                onNavigate(nextView);
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
                text: 'No se pudo conectar con el servidor. Inténtalo más tarde.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <Loader text="Iniciando sesión..." />}
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
                            {/* Email */}
                            <div>
                                <label className="block text-[#1E3A5F]">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="id_CorreoUsuario"
                                    value={formData.id_CorreoUsuario}
                                    onChange={handleChange}
                                    required
                                    placeholder="correo@ejemplo.com"
                                    className="mt-2 w-full border border-[#E2E8F0] rounded-md px-3 py-2 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
                                    autoComplete="email"
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
                                        minLength={8}
                                        placeholder="••••••••"
                                        className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 pr-10 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]"
                                        autoComplete="current-password"
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

                            {/* Opciones */}
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
                                    onClick={() => onNavigate('forgot_password')}
                                    className="text-[#2B6CB0] hover:text-[#2563a7] transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>

                            {/* Botón */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-[#2B6CB0] hover:bg-[#2563a7] text-white py-3 rounded-lg"
                            >
                                <LogIn size={18} />
                                Iniciar Sesión
                            </button>
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
        </>

    );
}
