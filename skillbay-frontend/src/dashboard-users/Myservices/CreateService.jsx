import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Package,
    Upload,
    DollarSign,
    Clock,
    Tag,
    Image as ImageIcon,
    Loader2
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { API_URL } from "../../config/api";
import { resolveImageUrl } from "../../utils/image";
import Swal from "sweetalert2";

export default function CreateService() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    // Form data for service (offered by user)
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        categoria: "",
        subcategoria: "",
        precio: "",
        tiempo_entrega: "",
        imagen: null,
    });

    const [previewImage, setPreviewImage] = useState(null);


    // Get unique category groups from categories array
    const categoryGroups = useMemo(() => {
        if (!categories || !Array.isArray(categories)) return [];
        const groups = [...new Set(categories.map(cat => cat && cat.grupo))].filter(Boolean);
        console.log("Category groups computed:", groups);
        return groups.sort();
    }, [categories]);
    
    // Get subcategories for the selected group
    const availableSubcategories = useMemo(() => {
        if (!formData.categoria || !categories || !Array.isArray(categories)) return [];
        return categories.filter(cat => cat && cat.grupo === formData.categoria);
    }, [formData.categoria, categories]);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/categorias`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            console.log("API Response for categories:", data);
            
            // Handle both response formats: { categorias: [...] } or directly [...]
            let categoriasArray = [];
            if (Array.isArray(data)) {
                categoriasArray = data;
            } else if (data.categorias && Array.isArray(data.categorias)) {
                categoriasArray = data.categorias;
            }
            
            if (categoriasArray.length > 0) {
                console.log("Setting categories:", categoriasArray);
                console.log("Groups found:", [...new Set(categoriasArray.map(cat => cat.grupo))].filter(Boolean));
                setCategories(categoriasArray);
            } else {
                console.error("No categories found in response:", data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setCategoriesLoading(false);
        }
    };
    
    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    // Fetch categories when dialog opens to ensure fresh data
    useEffect(() => {
        if (isDialogOpen && categories.length === 0) {
            fetchCategories();
        }
    }, [isDialogOpen]);

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
                // Filter only services (tipo = 'servicio')
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

    const handleSubmit = async () => {
        // Use subcategoria (id_Categoria) for validation and submission
        const idCategoria = formData.subcategoria || formData.categoria;
        
        if (!formData.titulo || !formData.precio || !idCategoria) {
            Swal.fire({
                icon: 'info',
                title: 'Campos requeridos',
                text: 'Por favor completa el título, precio y selecciona una subcategoría.',
                confirmButtonColor: '#2563EB'
            });
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("access_token");
            const formDataToSend = new FormData();
            
            // Service fields
            formDataToSend.append("titulo", formData.titulo);
            formDataToSend.append("descripcion", formData.descripcion);
            // Send the id_Categoria (subcategoria value) - either from subcategoria or falls back to categoria
            formDataToSend.append("id_Categoria", formData.subcategoria || formData.categoria);
            formDataToSend.append("precio", formData.precio);
            formDataToSend.append("tiempo_entrega", formData.tiempo_entrega);
            
            // CRITICAL: Set type as 'servicio' (Lo ofrecen)
            formDataToSend.append("tipo", "servicio");
            
            if (formData.imagen) {
                formDataToSend.append("imagen", formData.imagen);
            }

            const url = editingService 
                ? `${API_URL}/servicios/${editingService.id_Servicio}`
                : `${API_URL}/servicios`;
            
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al guardar el servicio");
            }

            Swal.fire({
                icon: 'success',
                title: editingService ? 'Servicio actualizado' : 'Servicio creado',
                text: editingService 
                    ? 'Tu servicio ha sido actualizado correctamente.' 
                    : 'Tu servicio ha sido publicado correctamente.',
                timer: 2000,
                showConfirmButton: false,
            });

            setIsDialogOpen(false);
            fetchServices();
            resetForm();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSubmitting(false);
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

    const resetForm = () => {
        setEditingService(null);
        setFormData({
            titulo: "",
            descripcion: "",
            categoria: "",
            subcategoria: "",
            precio: "",
            tiempo_entrega: "",
            imagen: null,
        });
        setPreviewImage(null);
    };

    const handleNewService = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEditService = (service) => {
        setEditingService(service);
        
        // Find the category in API categories
        const cat = categories.find(c => c.id_Categoria === service.id_Categoria);
        
        setFormData({
            titulo: service.titulo,
            descripcion: service.descripcion,
            categoria: cat ? cat.grupo : "", // Set the group/parent category
            subcategoria: service.id_Categoria, // Set the actual id_Categoria
            precio: service.precio,
            tiempo_entrega: service.tiempo_entrega,
            imagen: null,
        });
        setPreviewImage(service.imagen ? resolveImageUrl(service.imagen) : null);
        
        setIsDialogOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryGroupChange = (value) => {
        setFormData((prev) => ({ ...prev, categoria: value, subcategoria: "" }));
    };

    const handleSubcategoryChange = (value) => {
        setFormData((prev) => ({ ...prev, subcategoria: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, imagen: file }));
            setPreviewImage(URL.createObjectURL(file));
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
            {/* Header */}
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

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={handleNewService}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Nuevo Servicio
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl sm:max-h-[90vh]">
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                                <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    {editingService ? 
                                        <Edit className="text-blue-600" /> : 
                                        <Package className="text-blue-600" />
                                    }
                                    {editingService ? "Editar Servicio" : "Publicar Nuevo Servicio"}
                                </DialogTitle>
                                <p className="text-sm text-slate-500 mt-1">
                                    Describe tu servicio profesional para atraer clientes.
                                </p>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Info Banner */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                    <Package className="text-blue-600 shrink-0 mt-0.5" size={20} />
                                    <div className="text-sm text-blue-800">
                                        <strong>¿Qué es un servicio?</strong> Es cuando ofreces tus habilidades y servicios profesionales. 
                                        Escribe qué haces, tu experiencia y el precio de tu trabajo.
                                    </div>
                                </div>

                                {/* Form Fields - Improved Responsive Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Title - Full Width on Desktop */}
                                    <div className="col-span-1 lg:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Tag size={16} /> Título del Servicio *
                                        </label>
                                        <Input
                                            name="titulo"
                                            placeholder="Ej: Diseño de UI/UX para App Móvil"
                                            value={formData.titulo}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-base"
                                        />
                                    </div>

                                    {/* Category Group and Subcategory - Full Width */}
                                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Tag size={16} /> Categoría *
                                            </label>
                                            <Select 
                                                value={formData.categoria} 
                                                onValueChange={handleCategoryGroupChange}
                                                disabled={categoriesLoading}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white">
                                                    <SelectValue placeholder={categoriesLoading ? "Cargando..." : "Seleccionar área..."} />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {categoryGroups.length > 0 ? (
                                                        categoryGroups.map((group) => (
                                                            <SelectItem key={group} value={group} className="cursor-pointer">
                                                                {group}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-slate-500 text-center">
                                                            No hay categorías disponibles
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Tag size={16} /> Subcategoría
                                            </label>
                                            <Select 
                                                value={formData.subcategoria || ""} 
                                                onValueChange={handleSubcategoryChange}
                                                disabled={!formData.categoria || categoriesLoading}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white">
                                                    <SelectValue placeholder={!formData.categoria ? "Selecciona primero un área" : "Seleccionar..."} />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {availableSubcategories.length > 0 ? (
                                                        availableSubcategories.map((cat) => (
                                                            <SelectItem key={cat.id_Categoria} value={cat.id_Categoria} className="cursor-pointer">
                                                                {cat.nombre}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-slate-500 text-center">
                                                            No hay subcategorías disponibles
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Price and Delivery Time - Full Width */}
                                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <DollarSign size={16} /> Precio (COP) *
                                            </label>
                                            <Input
                                                name="precio"
                                                type="number"
                                                placeholder="Ej: 500000"
                                                value={formData.precio}
                                                onChange={handleInputChange}
                                                className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono text-base"
                                            />
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
                                    </div>

                                    {/* Description - Full Width */}
                                    <div className="col-span-1 lg:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Descripción del Servicio
                                        </label>
                                        <Textarea
                                            name="descripcion"
                                            placeholder="Describe qué incluye tu servicio, metodología, entregables..."
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-y"
                                        />
                                    </div>

                                    {/* Image - Full Width */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <ImageIcon size={16} /> Imagen de Portada (opcional)
                                        </label>
                                        <div className="group relative w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden">
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
                                                            <Upload size={18} /> Cambiar
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                    <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                        <Upload size={24} className="text-blue-500" />
                                                    </div>
                                                    <p className="font-medium text-slate-600 text-sm">Ej: Portfolio o trabajo realizado</p>
                                                    <p className="text-xs">Max 2MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="h-11 px-5 rounded-xl hover:bg-slate-200 text-slate-600 font-medium"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-semibold min-w-40"
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
            {services.length > 0 && (
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
                                    <div className="w-full h-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                        <Package size={48} className="text-blue-300" />
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
