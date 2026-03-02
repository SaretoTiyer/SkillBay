import { useState, useEffect } from "react";
import { Loader2, Check, X, Clock } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import { API_URL } from "../../config/api";
import Swal from "sweetalert2";

export default function ReceivedRequests() {
    const [serviceRequests, setServiceRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [updatingRequestId, setUpdatingRequestId] = useState(null);

    useEffect(() => {
        fetchServiceRequests();
    }, []);

    const fetchServiceRequests = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/servicios/solicitudes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                setServiceRequests(data.solicitudes || []);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoadingRequests(false);
        }
    };

    const updateServiceRequestStatus = async (requestId, status) => {
        setUpdatingRequestId(requestId);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/servicios/solicitudes/${requestId}/estado`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ estado: status }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || "No se pudo actualizar el estado de la solicitud.");
            }

            setServiceRequests((prev) =>
                prev.map((item) =>
                    item.id === requestId ? { ...item, estado: status } : item
                )
            );

            Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                timer: 1400,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire('Error', error.message || 'No se pudo actualizar la solicitud.', 'error');
        } finally {
            setUpdatingRequestId(null);
        }
    };

    const getRequestStatusBadge = (status) => {
        const tones = {
            pendiente: "bg-amber-100 text-amber-700 border-amber-200",
            aceptada: "bg-blue-100 text-blue-700 border-blue-200",
            rechazada: "bg-red-100 text-red-700 border-red-200",
            cancelada: "bg-slate-100 text-slate-700 border-slate-200",
            en_progreso: "bg-purple-100 text-purple-700 border-purple-200",
            completada: "bg-green-100 text-green-700 border-green-200",
        };

        const labels = {
            pendiente: "Pendiente",
            aceptada: "Aceptada",
            rechazada: "Rechazada",
            cancelada: "Cancelada",
            en_progreso: "En Progreso",
            completada: "Completada",
        };

        return (
            <Badge className={`${tones[status] || 'bg-slate-100 text-slate-700'} border-0 px-3 py-1 font-medium`}>
                {labels[status] || status}
            </Badge>
        );
    };

    if (loadingRequests) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Solicitudes Recibidas</h2>
                    <p className="text-slate-500 text-sm">Gestiona las solicitudes de servicio que has recibido</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 px-3 py-1">
                    {serviceRequests.length} solicitudes
                </Badge>
            </div>

            {serviceRequests.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                    Aún no tienes solicitudes en tus servicios.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {serviceRequests.map((request) => (
                        <article key={request.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-800 line-clamp-1">{request?.servicio?.titulo || "Servicio"}</h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Solicitante: {request?.usuario?.nombre || "Usuario"} {request?.usuario?.apellido || ""}
                                    </p>
                                </div>
                                {getRequestStatusBadge(request.estado)}
                            </div>

                            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 min-h-[78px] mb-3">
                                {request.mensaje || "Sin mensaje."}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-xs text-slate-500">
                                    {request.created_at ? new Date(request.created_at).toLocaleString("es-CO") : "Fecha no disponible"}
                                </p>
                                <div className="flex gap-2">
                                    {request.estado === "pendiente" && (
                                        <>
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                disabled={updatingRequestId === request.id}
                                                onClick={() => updateServiceRequestStatus(request.id, "aceptada")}
                                            >
                                                <Check size={14} className="mr-1" /> Aceptar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                                disabled={updatingRequestId === request.id}
                                                onClick={() => updateServiceRequestStatus(request.id, "rechazada")}
                                            >
                                                <X size={14} className="mr-1" /> Rechazar
                                            </Button>
                                        </>
                                    )}
                                    {request.estado === "aceptada" && (
                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={updatingRequestId === request.id}
                                            onClick={() => updateServiceRequestStatus(request.id, "en_progreso")}
                                        >
                                            ▶ Iniciar Trabajo
                                        </Button>
                                    )}
                                    {request.estado === "en_progreso" && (
                                        <Button
                                            size="sm"
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                            disabled={updatingRequestId === request.id}
                                            onClick={async () => {
                                                const confirm = await Swal.fire({
                                                    title: '¿Marcar trabajo como completado?',
                                                    text: 'Esto habilitará el pago del servicio.',
                                                    icon: 'question',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Sí, está completado',
                                                    cancelButtonText: 'Cancelar',
                                                });
                                                if (!confirm.isConfirmed) return;
                                                setUpdatingRequestId(request.id);
                                                try {
                                                    const token = localStorage.getItem("access_token");
                                                    const response = await fetch(`${API_URL}/postulaciones/${request.id}/completar`, {
                                                        method: "PATCH",
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                            'Content-Type': 'application/json',
                                                            'Accept': 'application/json'
                                                        },
                                                    });
                                                    const data = await response.json();
                                                    if (!response.ok) throw new Error(data?.message || "Error al marcar como completado.");
                                                    setServiceRequests((prev) =>
                                                        prev.map((item) =>
                                                            item.id === request.id ? { ...item, estado: 'completada' } : item
                                                        )
                                                    );
                                                    Swal.fire('¡Completado!', 'El trabajo ha sido marcado como completado.', 'success');
                                                } catch (error) {
                                                    Swal.fire('Error', error.message, 'error');
                                                } finally {
                                                    setUpdatingRequestId(null);
                                                }
                                            }}
                                        >
                                            ✓ Marcar Completado
                                        </Button>
                                    )}
                                    {request.estado === "completada" && (
                                        <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1">
                                            ✅ Listo para pago
                                        </Badge>
                                    )}
                                    {(request.estado === "rechazada" || request.estado === "cancelada") && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-slate-200 text-slate-700 hover:bg-slate-50"
                                            disabled={updatingRequestId === request.id}
                                            onClick={() => updateServiceRequestStatus(request.id, "pendiente")}
                                        >
                                            <Clock size={14} className="mr-1" /> Volver a Pendiente
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
