import { useState, useEffect } from "react";
import { Package, Loader2, Clock, Edit, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { API_URL } from "../config/api";
import { resolveImageUrl } from "../utils/image";
import Swal from "sweetalert2";

export default function MyServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/servicios`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                // Filter only services (tipo = 'servicio') - not opportunities
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
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Error al eliminar el servicio");

            setServices(services.filter(s => s.id_Servicio !== serviceId));
            Swal.fire('Eliminado', 'El servicio ha sido eliminado.', 'success');
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const getStatusBadge = (status) => {
        return (
            <Badge className={`${status === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-0 px-3 py-1`}>
                {status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Mis Servicios</h2>
                <p className="text-slate-500">Gestiona los servicios que ofreces (tipo: Lo ofrecen)</p>
            </div>

            {services.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                        <Package size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes servicios publicados</h3>
                    <p className="text-slate-500">Crea una oportunidad para ofrecer tus servicios.</p>
                </div>
            )}

            {services.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div
                            key={service.id_Servicio}
                            className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:-translate-y-1"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <ImageWithFallback
                                    src={resolveImageUrl(service.imagen)}
                                    alt={service.titulo}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(service.estado)}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-0">
                                            {service.categoria?.nombre || "General"}
                                        </Badge>
                                    </div>
                                    <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">
                                        {service.titulo}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                                    <Clock size={16} />
                                    <span>Entrega: <span className="font-medium text-slate-700">{service.tiempo_entrega || "A convenir"}</span></span>
                                </div>

                                <p className="text-slate-600 line-clamp-3 mb-6 text-sm h-[60px]">
                                    {service.descripcion}
                                </p>

                                <div className="flex items-end justify-between border-t border-slate-100 pt-6">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Precio</p>
                                        <p className="text-2xl font-bold text-blue-600 font-mono">
                                            ${parseFloat(service.precio).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="rounded-xl hover:bg-red-50 hover:text-red-600 border-slate-200"
                                            onClick={() => handleDeleteService(service.id_Servicio)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
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
