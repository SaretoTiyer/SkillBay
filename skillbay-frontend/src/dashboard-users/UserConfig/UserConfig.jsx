import { useState, useEffect } from "react";
import { Shield, CreditCard, Bell, Smartphone, QrCode, Upload, Eye, EyeOff, Check, X, Lock, LogOut } from "lucide-react";
import { API_URL } from "../../config/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { showSuccess, showError, showInputModal, showConfirm } from "../../utils/swalHelpers";

export default function UserConfig({ onNavigate }) {
    const [activeSection, setActiveSection] = useState("overview");
    const [metodosPago, setMetodosPago] = useState({
        nequi_numero: "",
        nequi_nombre: "",
        nequi_qr: "",
        bancolombia_qr: "",
        metodos_pago_activos: ["tarjeta", "efectivo"],
    });
    const [localMetodos, setLocalMetodos] = useState(metodosPago);
    const [savingMetodos, setSavingMetodos] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ password: "", password_confirmation: "" });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [notifications, setNotifications] = useState({
        email_notificaciones: true,
        notificacion_postulaciones: true,
        notificacion_pagos: true,
        notificacion_mensajes: true,
        notificacion_sistema: false,
    });
    const [savingNotifications, setSavingNotifications] = useState(false);

    const authHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
    });

    useEffect(() => {
        fetchMetodosPago();
        fetchNotifications();
    }, []);

    useEffect(() => {
        setLocalMetodos(metodosPago);
    }, [metodosPago]);

    const fetchMetodosPago = async () => {
        try {
            const response = await fetch(`${API_URL}/user/metodos-pago`, { headers: authHeaders() });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMetodosPago({
                        nequi_numero: data.data.nequi_numero || "",
                        nequi_nombre: data.data.nequi_nombre || "",
                        nequi_qr: data.data.nequi_qr || "",
                        bancolombia_qr: data.data.bancolombia_qr || "",
                        metodos_pago_activos: data.data.metodos_pago_activos || ["tarjeta", "efectivo"],
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching metodos pago:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API_URL}/user`, { headers: authHeaders() });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setNotifications((prev) => ({
                        ...prev,
                        ...data.data.notificaciones_preferencias,
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.password || !passwordData.password_confirmation) {
            setPasswordErrors({ general: "Por favor ingresa ambas contraseñas." });
            return;
        }
        if (passwordData.password !== passwordData.password_confirmation) {
            setPasswordErrors({ general: "Las contraseñas no coinciden." });
            return;
        }
        if (passwordData.password.length < 8) {
            setPasswordErrors({ general: "La contraseña debe tener al menos 8 caracteres." });
            return;
        }

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/user`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: passwordData.password }),
            });

            if (response.ok) {
                showSuccess("Contraseña actualizada", "Tu contraseña ha sido cambiada correctamente.");
                setPasswordData({ password: "", password_confirmation: "" });
                setPasswordErrors({});
            } else {
                const errorData = await response.json();
                setPasswordErrors({ general: errorData.message || "No se pudo cambiar la contraseña." });
            }
        } catch (error) {
            showError("Error", "No se pudo cambiar la contraseña.");
        }
    };

    const handleSaveMetodos = async () => {
        setSavingMetodos(true);
        try {
            const response = await fetch(`${API_URL}/user/metodos-pago`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(localMetodos),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Error al guardar");
            }

            setMetodosPago(localMetodos);
            showSuccess("Guardado", "Métodos de pago actualizados correctamente.");
        } catch (error) {
            showError("Error", error.message || "No se pudieron guardar los métodos de pago.");
        } finally {
            setSavingMetodos(false);
        }
    };

    const handleUploadQR = async (tipo) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('qr', file);
            formData.append('tipo', tipo);
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`${API_URL}/user/metodos-pago/qr`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                const data = await response.json();
                if (response.ok) {
                    setLocalMetodos(prev => ({ ...prev, [tipo]: data.path }));
                    showSuccess("QR subido", "Tu código QR ha sido actualizado.");
                } else {
                    showError("Error", data.message || "No se pudo subir el QR.");
                }
            } catch (error) {
                showError("Error", "No se pudo subir el QR.");
            }
        };
        input.click();
    };

    const handleSaveNotifications = async () => {
        setSavingNotifications(true);
        try {
            const response = await fetch(`${API_URL}/user`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify({ notificaciones_preferencias: notifications }),
            });

            if (response.ok) {
                showSuccess("Preferencias guardadas", "Tus preferencias de notificación han sido actualizadas.");
            } else {
                throw new Error("Error al guardar las preferencias.");
            }
        } catch (error) {
            showError("Error", "No se pudieron guardar las preferencias de notificación.");
        } finally {
            setSavingNotifications(false);
        }
    };

    const togglePaymentMethod = (method) => {
        setLocalMetodos((prev) => {
            const current = prev.metodos_pago_activos || [];
            const updated = current.includes(method)
                ? current.filter((m) => m !== method)
                : [...current, method];
            return { ...prev, metodos_pago_activos: updated };
        });
    };

    const passwordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: "", color: "" };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return { level: 1, label: "Débil", color: "bg-red-500" };
        if (score <= 2) return { level: 2, label: "Regular", color: "bg-orange-500" };
        if (score <= 3) return { level: 3, label: "Buena", color: "bg-yellow-500" };
        return { level: 4, label: "Fuerte", color: "bg-green-500" };
    };

    const strength = passwordStrength(passwordData.password);

    const sections = [
        { id: "overview", label: "General", icon: Shield },
        { id: "security", label: "Seguridad", icon: Lock },
        { id: "payments", label: "Métodos de pago", icon: CreditCard },
        { id: "notifications", label: "Notificaciones", icon: Bell },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Configuración</h3>
                <p className="text-sm text-gray-500">Administra la configuración de tu cuenta</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeSection === s.id
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <s.icon size={16} />
                        {s.label}
                    </button>
                ))}
            </div>

            {activeSection === "overview" && (
                <div className="space-y-4">
                    {[
                        { id: "security", icon: Shield, title: "Seguridad", desc: "Gestiona tu contraseña y seguridad de cuenta", color: "bg-blue-100 text-blue-600" },
                        { id: "payments", icon: CreditCard, title: "Métodos de pago", desc: "Administra cómo recibirás los pagos", color: "bg-green-100 text-green-600" },
                        { id: "notifications", icon: Bell, title: "Notificaciones", desc: "Configura tus preferencias de notificación", color: "bg-purple-100 text-purple-600" },
                    ].map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className="w-full flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center`}>
                                    <section.icon size={22} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{section.title}</p>
                                    <p className="text-sm text-gray-500">{section.desc}</p>
                                </div>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>
                    ))}
                </div>
            )}

            {activeSection === "security" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock size={20} className="text-blue-600" />
                            Cambiar contraseña
                        </h4>

                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={passwordData.password}
                                        onChange={(e) => {
                                            setPasswordData({ ...passwordData, password: e.target.value });
                                            setPasswordErrors({});
                                        }}
                                        placeholder="Mínimo 8 caracteres"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.level ? strength.color : "bg-gray-200"}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">Fortaleza: <span className="font-medium">{strength.label}</span></p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
                                <Input
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => {
                                        setPasswordData({ ...passwordData, password_confirmation: e.target.value });
                                        setPasswordErrors({});
                                    }}
                                    placeholder="Repite la contraseña"
                                />
                            </div>

                            {passwordErrors.general && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <X size={14} />
                                    {passwordErrors.general}
                                </p>
                            )}

                            <Button
                                onClick={handleChangePassword}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Actualizar contraseña
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === "payments" && (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <Shield className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-blue-900">Información importante</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Configura tus métodos de pago para que los clientes puedan pagarte por tus servicios.
                                    Tus datos de pago solo serán visibles cuando un cliente complete una contratación.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Métodos de pago aceptados</h4>
                        <div className="space-y-3">
                            {[
                                { id: "tarjeta", label: "Tarjeta de crédito/débito" },
                                { id: "efectivo", label: "Efectivo" },
                                { id: "nequi", label: "Nequi" },
                                { id: "bancolombia_qr", label: "QR Bancolombia" },
                            ].map((method) => (
                                <label
                                    key={method.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                        (localMetodos.metodos_pago_activos || []).includes(method.id)
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-gray-300"
                                    }`}>
                                        {(localMetodos.metodos_pago_activos || []).includes(method.id) && (
                                            <Check size={14} className="text-white" />
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={(localMetodos.metodos_pago_activos || []).includes(method.id)}
                                        onChange={() => togglePaymentMethod(method.id)}
                                    />
                                    <span className="text-sm font-medium text-gray-700">{method.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Smartphone size={20} className="text-purple-600" />
                            Nequi
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de Nequi</label>
                                <Input
                                    type="tel"
                                    value={localMetodos.nequi_numero}
                                    onChange={(e) => setLocalMetodos({ ...localMetodos, nequi_numero: e.target.value })}
                                    placeholder="3123456789"
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del titular</label>
                                <Input
                                    type="text"
                                    value={localMetodos.nequi_nombre}
                                    onChange={(e) => setLocalMetodos({ ...localMetodos, nequi_nombre: e.target.value })}
                                    placeholder="Nombre como aparece en Nequi"
                                    maxLength={100}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Código QR</label>
                            <div className="flex items-center gap-4">
                                {localMetodos.nequi_qr ? (
                                    <img src={localMetodos.nequi_qr} alt="QR Nequi" className="w-24 h-24 rounded-lg border border-gray-200 object-cover" />
                                ) : (
                                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                        <QrCode size={24} className="text-gray-400" />
                                    </div>
                                )}
                                <Button variant="outline" size="sm" onClick={() => handleUploadQR('nequi_qr')}>
                                    <Upload size={14} className="mr-1" />
                                    Subir QR
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CreditCard size={20} className="text-amber-600" />
                            Bancolombia
                        </h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Código QR</label>
                            <div className="flex items-center gap-4">
                                {localMetodos.bancolombia_qr ? (
                                    <img src={localMetodos.bancolombia_qr} alt="QR Bancolombia" className="w-24 h-24 rounded-lg border border-gray-200 object-cover" />
                                ) : (
                                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                        <QrCode size={24} className="text-gray-400" />
                                    </div>
                                )}
                                <Button variant="outline" size="sm" onClick={() => handleUploadQR('bancolombia_qr')}>
                                    <Upload size={14} className="mr-1" />
                                    Subir QR
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveMetodos} disabled={savingMetodos} className="bg-blue-600 hover:bg-blue-700">
                            {savingMetodos ? "Guardando..." : "Guardar métodos de pago"}
                        </Button>
                    </div>
                </div>
            )}

            {activeSection === "notifications" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell size={20} className="text-purple-600" />
                            Preferencias de notificación
                        </h4>
                        <p className="text-sm text-gray-500 mb-6">Elige qué tipo de notificaciones deseas recibir</p>

                        <div className="space-y-4">
                            {[
                                { key: "email_notificaciones", label: "Notificaciones por correo", desc: "Recibe actualizaciones importantes en tu email" },
                                { key: "notificacion_postulaciones", label: "Postulaciones", desc: "Cuando alguien se postula a tus servicios u oportunidades" },
                                { key: "notificacion_pagos", label: "Pagos", desc: "Confirmaciones de pago y estado de transacciones" },
                                { key: "notificacion_mensajes", label: "Mensajes", desc: "Cuando recibes un nuevo mensaje en una conversación" },
                                { key: "notificacion_sistema", label: "Actualizaciones del sistema", desc: "Nuevas funciones y mejoras de la plataforma" },
                            ].map((pref) => (
                                <div key={pref.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">{pref.label}</p>
                                        <p className="text-sm text-gray-500">{pref.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications({ ...notifications, [pref.key]: !notifications[pref.key] })}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            notifications[pref.key] ? "bg-blue-600" : "bg-gray-300"
                                        }`}
                                        role="switch"
                                        aria-checked={notifications[pref.key]}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                            notifications[pref.key] ? "translate-x-6" : "translate-x-0.5"
                                        }`} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button
                                onClick={handleSaveNotifications}
                                disabled={savingNotifications}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {savingNotifications ? "Guardando..." : "Guardar preferencias"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
