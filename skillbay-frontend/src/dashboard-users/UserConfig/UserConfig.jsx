import { useState, useEffect } from "react";
import { Shield, CreditCard, Bell, Smartphone, QrCode, Upload } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function UserConfig({ onNavigate }) {
    const [metodosPago, setMetodosPago] = useState({
        nequi_numero: "",
        nequi_nombre: "",
        nequi_qr: "",
        bancolombia_qr: "",
        metodos_pago_activos: ["tarjeta", "efectivo"],
    });
    const [localMetodos, setLocalMetodos] = useState(metodosPago);
    const [savingMetodos, setSavingMetodos] = useState(false);

    const authHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
    });

    useEffect(() => {
        fetchMetodosPago();
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

    const handleChangePassword = async () => {
        const { value: passwordValues } = await Swal.fire({
            title: 'Cambiar contraseña',
            html:
                '<input id="password1" type="password" class="swal2-input" placeholder="Nueva contraseña">' +
                '<input id="password2" type="password" class="swal2-input" placeholder="Confirmar contraseña">',
            confirmButtonText: 'Cambiar',
            showCancelButton: true,
            preConfirm: () => {
                const password1 = document.getElementById('password1').value;
                const password2 = document.getElementById('password2').value;
                if (!password1 || !password2) {
                    Swal.showValidationMessage('Por favor ingrese ambas contraseñas');
                    return false;
                }
                if (password1 !== password2) {
                    Swal.showValidationMessage('Las contraseñas no coinciden');
                    return false;
                }
                if (password1.length < 8) {
                    Swal.showValidationMessage('La contraseña debe tener al menos 8 caracteres');
                    return false;
                }
                return [password1, password2];
            }
        });

        if (passwordValues) {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`${API_URL}/user`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ password: passwordValues[0] }),
                });

                if (response.ok) {
                    Swal.fire({ icon: 'success', title: 'Contraseña cambiada', text: 'Tu contraseña ha sido actualizada correctamente.', timer: 1500, showConfirmButton: false });
                } else {
                    const errorData = await response.json();
                    Swal.fire({ icon: 'error', title: 'Error', text: errorData.message || 'No se pudo cambiar la contraseña.' });
                }
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
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
            Swal.fire({ icon: 'success', title: 'Guardado', text: 'Métodos de pago actualizados.', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
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
                const response = await fetch(`${API_URL}/user/qr`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                const data = await response.json();
                if (response.ok) {
                    setLocalMetodos(prev => ({ ...prev, [tipo]: data.path }));
                    Swal.fire({ icon: 'success', title: 'QR subido', text: 'Tu código QR ha sido actualizado.', timer: 1500, showConfirmButton: false });
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'No se pudo subir el QR.' });
                }
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        };
        input.click();
    };

    const configSections = [
        {
            id: 'security',
            icon: Shield,
            title: 'Seguridad',
            description: 'Gestiona tu contraseña y seguridad de cuenta',
            color: 'blue',
            action: { label: 'Cambiar contraseña', onClick: handleChangePassword },
        },
        {
            id: 'payments',
            icon: CreditCard,
            title: 'Métodos de pago',
            description: 'Administra cómo recibirás los pagos',
            color: 'green',
            action: { label: 'Ver', onClick: () => onNavigate && onNavigate('payments') },
        },
        {
            id: 'notifications',
            icon: Bell,
            title: 'Notificaciones',
            description: 'Configura tus preferencias de notificación',
            color: 'purple',
            action: { label: 'Configurar', onClick: () => onNavigate && onNavigate('notifications') },
        },
    ];

    return (
        <div className="space-y-8">
            {/* Config Hub */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Configuración</h3>
                <p className="text-sm text-gray-500">Administra la configuración de tu cuenta</p>
            </div>

            <div className="space-y-4">
                {configSections.map((section) => {
                    const colorMap = {
                        blue: 'bg-blue-100 text-blue-600',
                        green: 'bg-green-100 text-green-600',
                        purple: 'bg-purple-100 text-purple-600',
                    };
                    return (
                        <div key={section.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${colorMap[section.color]} rounded-xl flex items-center justify-center`}>
                                    <section.icon size={22} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{section.title}</p>
                                    <p className="text-sm text-gray-500">{section.description}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="px-4" onClick={section.action.onClick}>
                                {section.action.label}
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Payment Methods Detail */}
            <div className="border-t border-gray-200 pt-8">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">Métodos de Pago</h4>
                        <p className="text-sm text-gray-500 mt-1">Configura cómo recibirás los pagos de tus servicios</p>
                    </div>

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

                    <div className="border border-gray-200 rounded-xl p-6 space-y-6">
                        <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Smartphone size={18} className="text-purple-600" />
                            Nequi
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Nequi</label>
                                <Input
                                    type="tel"
                                    value={localMetodos.nequi_numero}
                                    onChange={(e) => setLocalMetodos({ ...localMetodos, nequi_numero: e.target.value })}
                                    placeholder="3123456789"
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del titular</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Código QR</label>
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

                    <div className="border border-gray-200 rounded-xl p-6 space-y-6">
                        <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                            <CreditCard size={18} className="text-amber-600" />
                            Bancolombia
                        </h5>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Código QR</label>
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
                            {savingMetodos ? 'Guardando...' : 'Guardar métodos de pago'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
