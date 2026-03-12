import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Clock,
    MapPin,
    CheckCircle,
    PauseCircle,
    AlertCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { API_URL } from "../../config/api";
import { resolveImageUrl } from "../../utils/image";
import FormOpportunity from "./FormOpportunity";
import Swal from "sweetalert2";

export default function CreateOpportunity() {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState(null);

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
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
                const oportunidades = Array.isArray(data.servicios)
                    ? data.servicios.filter(s => s.tipo === 'oportunidad')
                    : Array.isArray(data)
                        ? data.filter(s => s.tipo === 'oportunidad')
                        : [];
                setOpportunities(oportunidades);
            }
        } catch (error) {
            console.error("Error fetching opportunities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewOpportunity = () => {
        setEditingOpportunity(null);
        setShowForm(true);
    };

    const handleEditOpportunity = (opportunity) => {
        setEditingOpportunity(opportunity);
        setShowForm(true);
    };

    const handleDeleteOpportunity = async (opportunityId) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar oportunidad?',
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
            const response = await fetch(`${API_URL}/servicios/${opportunityId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if (!response.ok) throw new Error("Error al eliminar la oportunidad");

            setOpportunities(opportunities.filter(o => o.id_Servicio !== opportunityId));
            Swal.fire('Eliminado', 'La oportunidad ha sido eliminada.', 'success');
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

            setOpportunities(opportunities.map(opportunity =>
                opportunity.id_Servicio === id
                    ? { ...opportunity, estado: newStatus }
                    : opportunity
            ));

            Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: `La oportunidad ha sido marcada como ${newStatus.toLowerCase()}.`,
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

    const getUrgencyBadge = (urgencia) => {
        const colors = {
            baja: 'bg-blue-100 text-blue-700',
            media: 'bg-yellow-100 text-yellow-700',
            alta: 'bg-orange-100 text-orange-700',
            urgente: 'bg-red-100 text-red-700',
        };
        const labels = {
            baja: 'Baja',
            media: 'Media',
            alta: 'Alta',
            urgente: 'Urgente',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[urgencia] || colors.media}`}>
                {labels[urgencia] || urgencia}
            </span>
        );
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingOpportunity(null);
        fetchOpportunities();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingOpportunity(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500">Cargando oportunidades...</p>
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
                            <Search className="text-white h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Crear Oportunidad</h2>
                            <p className="text-slate-500 font-medium">Publica una necesidad que necesitas resolver</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleNewOpportunity}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nueva Oportunidad
                    </Button>
                </div>
            )}

            {/* Formulario completo */}
            {showForm && (
                <FormOpportunity 
                    onCancel={handleFormCancel}
                    onSuccess={handleFormSuccess}
                    editingOpportunity={editingOpportunity}
                />
            )}

            {/* Empty State */}
            {!showForm && opportunities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                        <Search size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes Oportunidades activas</h3>
                    <p className="text-slate-500 max-w-md mb-8">
                        ¿Necesitas ayuda con algo? Publica una Oportunidad y los profesionales te contactarán con sus propuestas.
                    </p>
                    <Button
                        onClick={handleNewOpportunity}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-95"
                    >
                        Publicar mi primera Oportunidad
                    </Button>
                </div>
            )}

            {/* Opportunities Grid */}
            {!showForm && opportunities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opportunity) => (
                        <div
                            key={opportunity.id_Servicio}
                            className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:-translate-y-1"
                        >
                            <div className="relative h-56 overflow-hidden">
                                {opportunity.imagen ? (
                                    <ImageWithFallback
                                        src={resolveImageUrl(opportunity.imagen)}
                                        alt={opportunity.titulo}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-center p-4">
                                        <AlertCircle size={32} className="text-white mb-2" />
                                        <p className="text-white text-sm font-medium">{opportunity.categoria?.nombre || 'Oportunidad'}</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

                                <div className="absolute top-4 right-4 flex gap-2">
                                    {getStatusBadge(opportunity.estado)}
                                    {opportunity.urgencia && getUrgencyBadge(opportunity.urgencia)}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-0 text-xs">
                                            {opportunity.categoria?.nombre || "General"}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
                                        {opportunity.titulo}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-5">
                                {opportunity.ubicacion && (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                                        <MapPin size={14} />
                                        <span>{opportunity.ubicacion}</span>
                                    </div>
                                )}

                                <p className="text-slate-600 line-clamp-2 mb-4 text-sm min-h-10">
                                    {opportunity.descripcion || "Sin descripción"}
                                </p>

                                <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Presupuesto</p>
                                        <p className="text-xl font-bold text-blue-600 font-mono">
                                            ${parseFloat(opportunity.precio || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="rounded-xl hover:bg-blue-50 hover:text-blue-600 border-slate-200"
                                            onClick={() => handleEditOpportunity(opportunity)}
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="rounded-xl hover:bg-red-50 hover:text-red-600 border-slate-200"
                                            onClick={() => handleDeleteOpportunity(opportunity.id_Servicio)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                        {opportunity.estado !== 'Activo' ? (
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="rounded-xl hover:bg-emerald-50 hover:text-emerald-600 border-emerald-200"
                                                onClick={() => handleChangeStatus(opportunity.id_Servicio, 'Activo')}
                                            >
                                                <CheckCircle size={16} className="text-emerald-600" />
                                            </Button>
                                        ) : (
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="rounded-xl hover:bg-amber-50 hover:text-amber-600 border-amber-200"
                                                onClick={() => handleChangeStatus(opportunity.id_Servicio, 'Inactivo')}
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
