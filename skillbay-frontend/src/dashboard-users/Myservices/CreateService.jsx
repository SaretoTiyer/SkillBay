import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Package,
    CheckCircle,
    PauseCircle,
    Clock,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { API_URL } from "../../config/api";
import { resolveImageUrl } from "../../utils/image";
import FormService from "./FormService";
import Swal from "sweetalert2";

export default function CreateService() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/servicios`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                const servicios = Array.isArray(data.servicios) 
                    ? data.servicios.filter(s => s.tipo === 'servicio' || !s.tipo)
                    : Array.isArray(data) 
                        ? data.filter(s => s.tipo === 'servicio' || !s.tipo)
                        : [];
                setServices(servicios);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewService = () => {
        setEditingService(null);
        setShowForm(true);
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setShowForm(true);
    };

    const handleDeleteService = async (serviceId) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar servicio?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
        });

        if (!confirm.isConfirmed) return;

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/servicios/${serviceId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if (!response.ok) throw new Error("Error al eliminar el servicio");

            setServices(services.filter(s => s.id_Servicio !== serviceId));
            Swal.fire('Eliminado', 'El servicio ha sido eliminado.', 'success');
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleChangeStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/servicios/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: newStatus })
            });

            if (!response.ok) throw new Error("Error al cambiar el estado");

            setServices(services.map(service =>
                service.id_Servicio === id
                    ? { ...service, estado: newStatus }
                    : service
            ));

            Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: `El servicio ha sido marcado como ${newStatus.toLowerCase()}.`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const getStatusBadge = (status) => {
        const isActive = status === 'Activo';
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
            }`}>
                {status || "Activo"}
            </span>
        );
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingService(null);
        fetchServices();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingService(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500">Cargando servicios...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            {!showForm && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-200">
                            <Package className="text-white h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Crear Servicio</h2>
                            <p className="text-slate-500 font-medium">Publica tus servicios profesionales</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleNewService}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nuevo Servicio
                    </Button>
                </div>
            )}

            {/* Formulario completo */}
            {showForm && (
                <FormService 
                    onCancel={handleFormCancel}
                    onSuccess={handleFormSuccess}
                    editingService={editingService}
                />
            )}

            {/* Empty State */}
            {!showForm && services.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                        <Package size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes servicios publicados</h3>
                    <p className="text-slate-500 max-w-md mb-8">
                        Comienza a ofrecer tus habilidades creando tu primer servicio profesional.
                    </p>
                    <Button
                        onClick={handleNewService}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-95"
                    >
                        Crear mi primer servicio
                    </Button>
                </div>
            )}

            {/* Services Grid */}
            {!showForm && services.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div
                            key={service.id_Servicio}
                            className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:-translate-y-1"
                        >
                            <div className="relative h-56 overflow-hidden">
                                {service.imagen ? (
                                    <ImageWithFallback
                                        src={resolveImageUrl(service.imagen)}
                                        alt={service.titulo}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-center p-4">
                                        <Package size={32} className="text-white mb-2" />
                                        <p className="text-white text-sm font-medium">{service.categoria?.nombre || 'Servicio'}</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(service.estado)}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-0 text-xs">
                                            {service.categoria?.nombre || "General"}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
                                        {service.titulo}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                                    <Clock size={14} />
                                    <span>Entrega: {service.tiempo_entrega || "A convenir"}</span>
                                </div>

                                <p className="text-slate-600 line-clamp-2 mb-4 text-sm min-h-10">
                                    {service.descripcion || "Sin descripción"}
                                </p>

                                <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Precio</p>
                                        <p className="text-xl font-bold text-blue-600 font-mono">
                                            ${parseFloat(service.precio || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="rounded-xl hover:bg-blue-50 hover:text-blue-600 border-slate-200"
                                            onClick={() => handleEditService(service)}
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="rounded-xl hover:bg-red-50 hover:text-red-600 border-slate-200"
                                            onClick={() => handleDeleteService(service.id_Servicio)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                        {service.estado !== 'Activo' ? (
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="rounded-xl hover:bg-emerald-50 hover:text-emerald-600 border-emerald-200"
                                                onClick={() => handleChangeStatus(service.id_Servicio, 'Activo')}
                                            >
                                                <CheckCircle size={16} className="text-emerald-600" />
                                            </Button>
                                        ) : (
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="rounded-xl hover:bg-amber-50 hover:text-amber-600 border-amber-200"
                                                onClick={() => handleChangeStatus(service.id_Servicio, 'Inactivo')}
                                            >
                                                <PauseCircle size={16} className="text-amber-600" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
