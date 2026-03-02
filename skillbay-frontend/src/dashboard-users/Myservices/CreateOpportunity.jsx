import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Upload,
    DollarSign,
    Clock,
    Tag,
    Image as ImageIcon,
    Loader2,
    MapPin,
    AlertCircle,
    Briefcase
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

export default function CreateOpportunity() {
    const [opportunities, setOpportunities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState(null);

    // Form data for opportunity (not service)
    const [formData, setFormData] = useState({
        titulo: "",              // Title of the need/requirement
        descripcion: "",         // Description of the problem/need
        categoria: "",           // Category group (parent)
        subcategoria: "",       // Actual id_Categoria
        precio: "",         // Estimated budget (instead of price)
        urgencia: "",            // Urgency level
        ubicacion: "",           // Location where service is needed
        tiempo_entrega: "",      // When needed by
        imagen: null,            // Optional image of what they need
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

    // Urgency options for opportunities
    const urgencyOptions = [
        { value: "baja", label: "Baja - Sin urgencia" },
        { value: "media", label: "Media - En las próximas semanas" },
        { value: "alta", label: "Alta - Lo necesito pronto" },
        { value: "urgente", label: "Urgente - Lo necesito inmediatamente" },
    ];

    useEffect(() => {
        fetchOpportunities();
        fetchCategories();
    }, []);

    // Fetch categories when dialog opens to ensure fresh data
    useEffect(() => {
        if (isDialogOpen && categories.length === 0) {
            fetchCategories();
        }
    }, [isDialogOpen]);

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

    const fetchOpportunities = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/servicios?tipo=oportunidad`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                // Filter only opportunities (tipo = 'oportunidad')
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

    const handleSubmit = async () => {
        // Use subcategoria (id_Categoria) for validation and submission
        const idCategoria = formData.subcategoria || formData.categoria;
        
        // Validate required fields for opportunity
        if (!formData.titulo || !idCategoria || !formData.precio) {
            Swal.fire({
                icon: 'info',
                title: 'Campos requeridos',
                text: 'Por favor completa el título, selecciona una subcategoría y el precio estimado.',
                confirmButtonColor: '#2563EB'
            });
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("access_token");
            const formDataToSend = new FormData();
            
            // Opportunity fields
            formDataToSend.append("titulo", formData.titulo);
            formDataToSend.append("descripcion", formData.descripcion);
            // Send the id_Categoria (subcategoria value) - either from subcategoria or falls back to categoria
            formDataToSend.append("id_Categoria", formData.subcategoria || formData.categoria);
            formDataToSend.append("precio", formData.precio);
            formDataToSend.append("tiempo_entrega", formData.tiempo_entrega);  // When needed by
            formDataToSend.append("ubicacion", formData.ubicacion);            // Location
            formDataToSend.append("urgencia", formData.urgencia);              // Urgency
            
            // CRITICAL: Set type as 'oportunidad' (Se busca)
            formDataToSend.append("tipo", "oportunidad");
            
            if (formData.imagen) {
                formDataToSend.append("imagen", formData.imagen);
            }

            const url = editingOpportunity 
                ? `${API_URL}/servicios/${editingOpportunity.id_Servicio}`
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
                throw new Error(data.message || data.errors?.id_Categoria?.[0] || "Error al guardar la oportunidad");
            }

            Swal.fire({
                icon: 'success',
                title: editingOpportunity ? 'Oportunidad actualizada' : 'Oportunidad creada',
                text: editingOpportunity 
                    ? 'Tu necesidad ha sido actualizada correctamente.' 
                    : 'Tu búsqueda ha sido publicada. Los ofertantes podrán verla y contactarte.',
                timer: 2500,
                showConfirmButton: false,
            });

            setIsDialogOpen(false);
            fetchOpportunities();
            resetForm();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSubmitting(false);
        }
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
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Error al eliminar la oportunidad");

            setOpportunities(opportunities.filter(o => o.id_Servicio !== opportunityId));
            Swal.fire('Eliminado', 'La oportunidad ha sido eliminada.', 'success');
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const resetForm = () => {
        setEditingOpportunity(null);
        setFormData({
            titulo: "",
            descripcion: "",
            categoria: "",
            subcategoria: "",
            precio: "",
            urgencia: "",
            ubicacion: "",
            tiempo_entrega: "",
            imagen: null,
        });
        setPreviewImage(null);
    };

    const handleNewOpportunity = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEditOpportunity = (opportunity) => {
        setEditingOpportunity(opportunity);
        
        // Find the category in API categories
        const cat = categories.find(c => c.id_Categoria === opportunity.id_Categoria);
        
        setFormData({
            titulo: opportunity.titulo,
            descripcion: opportunity.descripcion,
            categoria: cat ? cat.grupo : "", // Set the group/parent category
            subcategoria: opportunity.id_Categoria, // Set the actual id_Categoria
            precio: opportunity.precio,
            urgencia: opportunity.urgencia || "",
            ubicacion: opportunity.ubicacion || "",
            tiempo_entrega: opportunity.tiempo_entrega || "",
            imagen: null,
        });
        setPreviewImage(opportunity.imagen ? resolveImageUrl(opportunity.imagen) : null);
        
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

    const getUrgencyBadge = (urgencia) => {
        const urgencyStyles = {
            baja: 'bg-slate-100 text-slate-600',
            media: 'bg-blue-100 text-blue-700',
            alta: 'bg-blue-100 text-blue-700',
            urgente: 'bg-red-100 text-red-700',
        };
        const urgencyLabels = {
            baja: 'Baja',
            media: 'Media',
            alta: 'Alta',
            urgente: 'Urgente',
        };
        
        return (
            <Badge className={`${urgencyStyles[urgencia] || 'bg-slate-100 text-slate-600'} border-0 px-2 py-0.5 text-xs`}>
                {urgencyLabels[urgencia] || 'No especificada'}
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
                        <Search className="text-white h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Crear Oportunidad</h2>
                        <p className="text-slate-500 font-medium">Publica una necesidad que necesitas resolver</p>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={handleNewOpportunity}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Nueva Búsqueda
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl sm:max-h-[90vh]">
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                                <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    {editingOpportunity ? 
                                        <Edit className="text-blue-600" /> : 
                                        <Search className="text-blue-600" />
                                    }
                                    {editingOpportunity ? "Editar Necesidad" : "Publicar una Búsqueda"}
                                </DialogTitle>
                                <p className="text-sm text-slate-500 mt-1">
                                    Describe lo que necesitas. Los profesionales te contactarán con sus propuestas.
                                </p>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Info Banner */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
                                    <div className="text-sm text-blue-800">
                                        <strong>¿Qué es una búsqueda?</strong> Es cuando necesitas un servicio y quieres que los profesionales te encuentren. 
                                        Escribe qué necesitas, tu precio y cuándo lo necesitas.
                                    </div>
                                </div>

                                {/* Form Fields - Improved Responsive Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Title - Full Width on Desktop */}
                                    <div className="col-span-1 lg:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Search size={16} /> ¿Qué necesitas? *
                                        </label>
                                        <Input
                                            name="titulo"
                                            placeholder="Ej: Necesito desarrollar una tienda online para mi negocio"
                                            value={formData.titulo}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-base"
                                        />
                                    </div>

                                    {/* Category Group - Half Width on Desktop */}
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
                                                <SelectContent className="max-h-60 ounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white ">
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

                                    {/* Budget and Urgency - Half Width on Desktop */}
                                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <DollarSign size={16} /> precio (COP) *
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
                                                <Clock size={16} /> ¿Cuándo lo necesitas?
                                            </label>
                                            <Input
                                                name="tiempo_entrega"
                                                placeholder="Ej: En 2 semanas, Lo antes posible"
                                                value={formData.tiempo_entrega}
                                                onChange={handleInputChange}
                                                className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Urgency and Location - Half Width on Desktop */}
                                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <AlertCircle size={16} /> Nivel de urgencia
                                            </label>
                                            <Select 
                                                value={formData.urgencia} 
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, urgencia: value }))}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                                                    <SelectValue placeholder="Seleccionar urgencia..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {urgencyOptions.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <MapPin size={16} /> Ubicación
                                            </label>
                                            <Input
                                                name="ubicacion"
                                                placeholder="Ej: Bogotá, Chapinero"
                                                value={formData.ubicacion}
                                                onChange={handleInputChange}
                                                className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Description - Full Width */}
                                    <div className="col-span-1 lg:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Descripción detallada de tu necesidad
                                        </label>
                                        <Textarea
                                            name="descripcion"
                                            placeholder="Describe con detalle qué necesitas, qué esperas del servicio, cualquier requisito específico..."
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-y"
                                        />
                                    </div>

                                    {/* Optional Image - Full Width */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <ImageIcon size={16} /> Imagen de referencia (opcional)
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
                                                    <p className="font-medium text-slate-600 text-sm">Ej: Foto del problema o ejemplo</p>
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
                                        <>{editingOpportunity ? "Guardar Cambios" : "Publicar Búsqueda"}</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Empty State */}
            {opportunities.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                        <Search size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes búsquedas activas</h3>
                    <p className="text-slate-500 max-w-md mb-8">
                        ¿Necesitas ayuda con algo? Publica una búsqueda y los profesionales te contactarán con sus propuestas.
                    </p>
                    <Button
                        onClick={handleNewOpportunity}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-95"
                    >
                        Publicar mi primera búsqueda
                    </Button>
                </div>
            )}

            {/* Opportunities Grid */}
            {opportunities.length > 0 && (
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
                                    <div className="w-full h-full bg-linear-to-br from-blue-100 to-red-100 flex items-center justify-center">
                                        <Search size={48} className="text-blue-300" />
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
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">precio</p>
                                        <p className="text-xl font-bold text-blue-600 font-mono">
                                            ${parseFloat(opportunity.precio || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="rounded-xl hover:bg-red-50 hover:text-red-600 border-slate-200"
                                            onClick={() => handleDeleteOpportunity(opportunity.id_Servicio)}
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
