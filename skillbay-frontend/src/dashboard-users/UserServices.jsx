import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Package,
    Upload,
    X,
    Check,
    Loader2,
    DollarSign,
    Clock,
    Tag,
    Image as ImageIcon
} from "lucide-react";

import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "../components/ui/dialog";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { API_URL } from "../config/api";
import Swal from "sweetalert2";

export default function UserServices() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        categoria: "",
        precio: "",
        tiempo_entrega: "",
        imagen: null,
    });

    const [previewImage, setPreviewImage] = useState(null);

    const defaultCategories = [
        { id_Categoria: "web", nombre: "Desarrollo Web" },
        { id_Categoria: "design", nombre: "Diseño Gráfico" },
        { id_Categoria: "marketing", nombre: "Marketing Digital" },
        { id_Categoria: "consulting", nombre: "Consultoría" },
        { id_Categoria: "mobile", nombre: "Desarrollo Móvil" },
    ];

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            const response = await fetch(`${API_URL}/servicios`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/categorias`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data.length > 0 ? data : defaultCategories);
            } else {
                setCategories(defaultCategories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories(defaultCategories);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value) => {
        setFormData((prev) => ({ ...prev, categoria: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, imagen: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleNewService = () => {
        setEditingService(null);
        setFormData({
            titulo: "",
            descripcion: "",
            categoria: "",
            precio: "",
            tiempo_entrega: "",
            imagen: null,
        });
        setPreviewImage(null);
        setIsDialogOpen(true);
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setFormData({
            titulo: service.titulo,
            descripcion: service.descripcion,
            categoria: service.id_Categoria,
            precio: service.precio,
            tiempo_entrega: service.tiempo_entrega,
            imagen: null, // Keep null unless changed
        });
        setPreviewImage(service.imagen);
        setIsDialogOpen(true);
    };

    const handleDeleteService = async (id) => {
        const result = await Swal.fire({
            title: "¿Eliminar servicio?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#64748B",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            customClass: {
                popup: 'rounded-2xl font-sans'
            }
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`${API_URL}/servicios/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                });

                if (response.ok) {
                    setServices((prev) => prev.filter((s) => s.id_Servicio !== id));
                    Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
                } else {
                    Swal.fire("Error", "No se pudo eliminar el servicio.", "error");
                }
            } catch (error) {
                console.error("Error deleting service:", error);
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.titulo || !formData.precio || !formData.categoria) {
            Swal.fire({
                icon: 'info',
                title: 'Campos requeridos',
                text: 'Por favor completa el título, precio y categoría.',
                confirmButtonColor: '#2563EB'
            });
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("access_token");
            const url = editingService
                ? `${API_URL}/servicios/${editingService.id_Servicio}?_method=PUT`
                : `${API_URL}/servicios`;

            const payload = new FormData();
            payload.append("titulo", formData.titulo);
            payload.append("descripcion", formData.descripcion || "");
            payload.append("id_Categoria", formData.categoria);
            payload.append("precio", formData.precio);
            payload.append("tiempo_entrega", formData.tiempo_entrega || "");

            if (formData.imagen) {
                payload.append("imagen", formData.imagen);
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: payload,
            });

            if (response.ok) {
                setIsDialogOpen(false);
                fetchServices();
                Swal.fire({
                    icon: "success",
                    title: "¡Éxito!",
                    text: editingService ? "Servicio actualizado correctamente" : "Servicio publicado exitosamente",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const errorData = await response.json();
                console.error("Server Error:", errorData);

                let errorMessage = "Revisa los datos e intenta nuevamente.";

                if (response.status === 422 && errorData.errors) {
                    // Format validation errors
                    const errors = Object.values(errorData.errors).flat();
                    errorMessage = errors.join("<br>");
                } else if (response.status === 401) {
                    errorMessage = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
                    // Optional: Redirect to login or clear bad token
                    // localStorage.removeItem("access_token");
                    // window.location.href = "/login";
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }

                Swal.fire({
                    icon: "error",
                    title: "Error al guardar",
                    html: errorMessage, // Use html to show line breaks
                    confirmButtonColor: '#2B6CB0'
                });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor.",
                confirmButtonColor: '#2B6CB0'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        return (
            <Badge className={`${status === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'
                } text-white border-0 shadow-sm backdrop-blur-sm px-3 py-1`}>
                {status || 'Borrador'}
            </Badge>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-200">
                        <Package className="text-white h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mis Servicios</h1>
                        <p className="text-slate-500 font-medium">Gestiona y promociona tus ofertas profesionales</p>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={handleNewService}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 text-lg"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Nuevo Servicio
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl sm:max-h-[85vh]">
                        <div className="flex flex-col h-full max-h-[85vh]">
                            <DialogHeader className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                                <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                    {editingService ? <Edit className="text-blue-600" /> : <Package className="text-blue-600" />}
                                    {editingService ? "Editar Servicio" : "Crear Nuevo Servicio"}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Image Upload Area */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <ImageIcon size={16} /> Imagen de Portada
                                    </label>
                                    <div className="group relative w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                        {previewImage ? (
                                            <>
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium flex items-center gap-2">
                                                        <Upload size={18} /> Cambiar Imagen
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                    <Upload size={32} className="text-blue-500" />
                                                </div>
                                                <p className="font-medium text-slate-600">Haz clic o arrastra una imagen</p>
                                                <p className="text-xs">Recomendado: 1200x800px (Max 2MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Título del Servicio</label>
                                        <Input
                                            name="titulo"
                                            placeholder="Ej: Diseño de UI/UX para App Móvil"
                                            value={formData.titulo}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-lg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Tag size={16} /> Categoría
                                        </label>
                                        <Select value={formData.categoria} onValueChange={handleSelectChange}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id_Categoria} value={cat.id_Categoria}>
                                                        {cat.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Clock size={16} /> Tiempo de Entrega
                                        </label>
                                        <Input
                                            name="tiempo_entrega"
                                            placeholder="Ej: 2 semanas"
                                            value={formData.tiempo_entrega}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <DollarSign size={16} /> Precio (COP)
                                        </label>
                                        <Input
                                            name="precio"
                                            type="number"
                                            placeholder="0"
                                            value={formData.precio}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono text-lg"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Descripción Detallada</label>
                                        <Textarea
                                            name="descripcion"
                                            placeholder="Describe qué incluye tu servicio, metodología, entregables..."
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-y"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="h-12 px-6 rounded-xl hover:bg-slate-200 text-slate-600 font-medium"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-semibold text-lg min-w-[150px]"
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin mr-2" />
                                    ) : (
                                        <>{editingService ? "Guardar Cambios" : "Publicar Servicio"}</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Empty State */}
            {services.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                        <Package size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes servicios activos</h3>
                    <p className="text-slate-500 max-w-md mb-8">Comienza a vender tus habilidades creando tu primer servicio profesional en nuestra plataforma.</p>
                    <Button
                        onClick={handleNewService}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-95"
                    >
                        Crear mi primer servicio
                    </Button>
                </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                    <div
                        key={service.id_Servicio}
                        className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:-translate-y-1"
                    >
                        <div className="relative h-64 overflow-hidden">
                            <ImageWithFallback
                                src={service.imagen}
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
                                        className="rounded-xl hover:bg-blue-50 hover:text-blue-600 border-slate-200"
                                        onClick={() => handleEditService(service)}
                                    >
                                        <Edit size={18} />
                                    </Button>
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
        </div>
    );
}
