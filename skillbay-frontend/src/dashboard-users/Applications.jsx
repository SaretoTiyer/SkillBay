import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
    FileText,
    Calendar,
    DollarSign,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { API_URL } from '../config/api';
import { resolveImageUrl } from '../utils/image';

import { Badge } from '../components/ui/badge';
import { Button } from "../components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setError("No has iniciado sesión");
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/postulaciones`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(Array.isArray(data) ? data : []);
            } else {
                if (response.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user_data");
                    window.location.href = "/login";
                    return;
                }
                console.error("Failed to fetch applications");
                setError("Error al cargar las postulaciones");
            }
        } catch (err) {
            console.error("Error fetching applications:", err);
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pendiente':
                return (
                    <Badge className="bg-amber-500 text-white flex gap-1 items-center px-3 py-1">
                        <Clock size={14} /> Pendiente
                    </Badge>
                );
            case 'aceptada':
            case 'bired': // Case for existing logic if any
                return (
                    <Badge className="bg-emerald-500 text-white flex gap-1 items-center px-3 py-1">
                        <CheckCircle size={14} /> Aceptada
                    </Badge>
                );
            case 'rechazada':
                return (
                    <Badge className="bg-red-500 text-white flex gap-1 items-center px-3 py-1">
                        <XCircle size={14} /> Rechazada
                    </Badge>
                );
            default:
                return <Badge className="bg-gray-500 text-white">{status}</Badge>;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendiente': return 'border-l-amber-500';
            case 'aceptada': return 'border-l-emerald-500';
            case 'rechazada': return 'border-l-red-500';
            default: return 'border-l-gray-300';
        }
    };

    const pending = applications.filter(a => a.estado === 'pendiente');
    const accepted = applications.filter(a => a.estado === 'aceptada');
    const rejected = applications.filter(a => a.estado === 'rechazada');

    const reportApplication = async (application) => {
        const { value: motivo } = await Swal.fire({
            title: 'Reportar usuario/postulacion',
            input: 'textarea',
            inputLabel: 'Motivo del reporte',
            showCancelButton: true,
            confirmButtonText: 'Reportar',
            cancelButtonText: 'Cancelar',
        });
        if (!motivo || motivo.trim().length < 10) return;

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/reportes`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    id_Postulacion: application.id,
                    id_Servicio: application.id_Servicio,
                    id_Reportado: application.servicio?.cliente_usuario?.id_CorreoUsuario,
                    motivo: motivo.trim(),
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || 'No se pudo reportar.');
            Swal.fire('Enviado', 'Reporte registrado correctamente.', 'success');
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const ApplicationCard = ({ application }) => (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${getStatusColor(application.estado)} overflow-hidden hover:shadow-md transition-all duration-300`}>
            <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div className="h-48 md:h-auto relative overflow-hidden group">
                    <ImageWithFallback
                        src={resolveImageUrl(application.servicio?.imagen)}
                        alt={application.servicio?.titulo || "Servicio"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{application.servicio?.titulo}</h3>
                            <p className="text-slate-500 line-clamp-2 text-sm">{application.servicio?.descripcion}</p>
                        </div>
                        {getStatusBadge(application.estado)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-blue-500" />
                            <span className="truncate">{application.servicio?.cliente_usuario?.nombre || 'Cliente'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-emerald-500" />
                            <span>{application.presupuesto ? `$${Number(application.presupuesto).toLocaleString()}` : 'A convenir'}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <Calendar size={16} className="text-indigo-500" />
                            <span>Postulado: {new Date(application.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <FileText size={14} /> Tu propuesta
                        </h4>
                        <p className="text-sm text-slate-600 italic">"{application.mensaje}"</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700"> Ver Detalles </Button>

                        {application.estado === 'pendiente' && (
                            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">Editar Propuesta</Button>
                        )}

                        {application.estado === 'aceptada' && (
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">Ir al Proyecto</Button>
                        )}
                        <Button
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => reportApplication(application)}
                        >
                            Reportar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mis Postulaciones</h1>
                    <p className="text-slate-500 mt-1">Gestiona el estado de tus propuestas enviadas</p>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">No tienes postulaciones</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Aún no te has postulado a ningún servicio. Explora las oportunidades disponibles.</p>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">Explorar Servicios</Button>
                </div>
            ) : (
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-white p-1 rounded-xl border border-slate-200 mb-8 inline-flex h-auto">
                        <TabsTrigger value="all" className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Todas ({applications.length})</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">Pendientes ({pending.length})</TabsTrigger>
                        <TabsTrigger value="hired" className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">Aceptadas ({accepted.length})</TabsTrigger>
                        <TabsTrigger value="rejected" className="rounded-lg px-4 py-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Rechazadas ({rejected.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-6 animate-in fade-in-50 duration-500">
                        {applications.map(app => (
                            <ApplicationCard key={app.id} application={app} />
                        ))}
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-6 animate-in fade-in-50 duration-500">
                        {pending.length > 0 ? pending.map(app => (
                            <ApplicationCard key={app.id} application={app} />
                        )) : <p className="text-center text-slate-500 py-8">No tienes postulaciones pendientes.</p>}
                    </TabsContent>

                    <TabsContent value="hired" className="space-y-6 animate-in fade-in-50 duration-500">
                        {accepted.length > 0 ? accepted.map(app => (
                            <ApplicationCard key={app.id} application={app} />
                        )) : <p className="text-center text-slate-500 py-8">No tienes propuestas aceptadas aún.</p>}
                    </TabsContent>

                    <TabsContent value="rejected" className="space-y-6 animate-in fade-in-50 duration-500">
                        {rejected.length > 0 ? rejected.map(app => (
                            <ApplicationCard key={app.id} application={app} />
                        )) : <p className="text-center text-slate-500 py-8">No tienes propuestas rechazadas.</p>}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
