import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
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

    const sanitize = (name, value) => {
        if (value == null) return '';
        let s = String(value);

        s = s.replace(/[\u0000-\u001F\u007F]/g, '');
        s = s.replace(/['"`;=<>\/\*]/g, '');

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

    const validate = () => {
        if (!formData.id_CorreoUsuario.trim() || !formData.password.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos vacios',
                text: 'Por favor, completa todos los campos antes de continuar.',
            });
            return false;
        }

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.id_CorreoUsuario);
        if (!emailOk) {
            Swal.fire({
                icon: 'error',
                title: 'Correo invalido',
                text: 'Ingresa un correo electronico valido.',
            });
            return false;
        }

        if (formData.password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña invalida',
                text: 'La contraseña debe tener minimo 8 caracteres.',
            });
            return false;
        }

        return true;
    };

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

            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: text || 'Respuesta no valida del servidor.',
                });
                return;
            }

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Bienvenido',
                    text: 'Inicio de sesion exitoso',
                    timer: 1500,
                    showConfirmButton: false,
                });

                localStorage.setItem('usuario', JSON.stringify(data.usuario || {}));
                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                }

                onLogin && onLogin(data);

                const nextView = data?.usuario?.rol === 'admin' ? 'admin_overview' : 'explore';
                onNavigate(nextView);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de autenticacion',
                    text: data.message || 'Credenciales incorrectas.',
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'No se pudo conectar con el servidor. Intentalo mas tarde.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <Loader text="Iniciando sesion..." />}
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1E3A5F] via-[#2B6CB0] to-[#1E3A5F] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
                        <button
                            type="button"
                            onClick={() => onNavigate('home')}
                            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
                        >
                            <ArrowLeft size={16} />
                            Regresar
                        </button>

                        <div className="flex justify-center mb-8">
                            <img src={logoFull} alt="SkillBay" className="h-16" />
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-[#1E3A5F] mb-2">Iniciar Sesion</h2>
                            <p className="text-[#A0AEC0]">Bienvenido de nuevo a SkillBay</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[#1E3A5F]">Correo Electronico</label>
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
                                    Olvidaste tu Contraseña?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-[#2B6CB0] hover:bg-[#2563a7] text-white py-3 rounded-lg"
                            >
                                <LogIn size={18} />
                                Iniciar Sesion
                            </button>
                        </form>

                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-[#E2E8F0]" />
                            <span className="text-[#A0AEC0]">o</span>
                            <div className="flex-1 h-px bg-[#E2E8F0]" />
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[#A0AEC0]">
                                No tienes una cuenta?{' '}
                                <button
                                    onClick={() => onNavigate('register')}
                                    className="text-[#2B6CB0] hover:text-[#2563a7] transition-colors"
                                >
                                    Registrate
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
