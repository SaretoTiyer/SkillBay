import { useState, useEffect, useMemo } from "react";
import {
    ArrowLeft,
    Edit,
    Search,
    Upload,
    DollarSign,
    Clock,
    Tag,
    Image as ImageIcon,
    Loader2,
    MapPin,
    AlertCircle,
    Globe,
    CreditCard,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { API_URL } from "../../config/api";
import Swal from "sweetalert2";

export default function FormOpportunity({ onCancel, onSuccess, editingOpportunity = null, categories: initialCategories = [] }) {
    const [categories, setCategories] = useState(initialCategories);
    const [categoriesLoading, setCategoriesLoading] = useState(initialCategories.length === 0);
    const [submitting, setSubmitting] = useState(false);

    const urgencyOptions = [
        { value: "baja", label: "Baja - Sin urgencia" },
        { value: "media", label: "Media - En las próximas semanas" },
        { value: "alta", label: "Alta - Lo necesito pronto" },
        { value: "urgente", label: "Urgente - Lo necesito inmediatamente" },
    ];

    const [formData, setFormData] = useState({
        titulo: editingOpportunity?.titulo || "",
        descripcion: editingOpportunity?.descripcion || "",
        categoria: "",
        subcategoria: editingOpportunity?.id_Categoria?.toString() || "",
        precio: editingOpportunity?.precio?.toString() || "",
        urgencia: editingOpportunity?.urgencia || "",
        ubicacion: editingOpportunity?.ubicacion || "",
        tiempo_entrega: editingOpportunity?.tiempo_entrega || "",
        tiempo_entrega_num: editingOpportunity?.tiempo_entrega ? editingOpportunity.tiempo_entrega.split(" ")[0] : "",
        tiempo_entrega_unidad: editingOpportunity?.tiempo_entrega ? editingOpportunity.tiempo_entrega.split(" ")[1] || "Días" : "Días",
        imagen: null,
        modo_trabajo: editingOpportunity?.modo_trabajo || "",
        metodos_pago: editingOpportunity?.metodos_pago || ["tarjeta", "efectivo"],
    });

    const [previewImage, setPreviewImage] = useState(editingOpportunity?.imagen || null);

    const categoryGroups = useMemo(() => {
        if (!categories || !Array.isArray(categories)) return [];
        return [...new Set(categories.map(cat => cat && cat.grupo))].filter(Boolean).sort();
    }, [categories]);

    const availableSubcategories = useMemo(() => {
        if (!formData.categoria || !categories || !Array.isArray(categories)) return [];
        return categories.filter(cat => cat && cat.grupo === formData.categoria);
    }, [formData.categoria, categories]);

    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories();
        }
    }, []);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/categorias`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });
            const data = await response.json();
            let categoriasArray = Array.isArray(data) ? data : (data.categorias || []);
            setCategories(categoriasArray);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryGroupChange = (value) => {
        setFormData(prev => ({ ...prev, categoria: value, subcategoria: "" }));
    };

    const handleSubcategoryChange = (value) => {
        setFormData(prev => ({ ...prev, subcategoria: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, imagen: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        const idCategoria = formData.subcategoria || formData.categoria;
        
        if (!formData.titulo || !formData.precio || !idCategoria || !formData.modo_trabajo) {
            Swal.fire({
                icon: 'info',
                title: 'Campos requeridos',
                text: 'Por favor completa el título, precio, selecciona una subcategoría y el modo de trabajo.',
                confirmButtonColor: '#2563EB'
            });
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("access_token");
            const formDataToSend = new FormData();
            
            formDataToSend.append("titulo", formData.titulo);
            formDataToSend.append("descripcion", formData.descripcion);
            formDataToSend.append("id_Categoria", idCategoria);
            formDataToSend.append("precio", formData.precio);
            formDataToSend.append("tiempo_entrega", formData.tiempo_entrega);
            formDataToSend.append("urgencia", formData.urgencia);
            formDataToSend.append("ubicacion", formData.ubicacion);
            formDataToSend.append("tipo", "oportunidad");
            formDataToSend.append("modo_trabajo", formData.modo_trabajo);
            formDataToSend.append("metodos_pago", JSON.stringify(formData.metodos_pago || []));
            
            if (formData.imagen && typeof formData.imagen !== 'string') {
                formDataToSend.append("imagen", formData.imagen);
            }

            const url = editingOpportunity 
                ? `${API_URL}/servicios/${editingOpportunity.id_Servicio}`
                : `${API_URL}/servicios`;
            
            const response = await fetch(url, {
                method: editingOpportunity ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al guardar la oportunidad");
            }

            Swal.fire({
                icon: 'success',
                title: editingOpportunity ? 'Oportunidad actualizada' : 'Oportunidad publicada',
                text: editingOpportunity 
                    ? 'Tu oportunidad ha sido actualizada correctamente.' 
                    : 'Tu oportunidad ha sido publicada correctamente.',
                timer: 2000,
                showConfirmButton: false,
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {editingOpportunity ? 
                                <Edit className="text-blue-600" /> : 
                                <Search className="text-blue-600" />
                            }
                            {editingOpportunity ? "Editar Necesidad" : "Publicar una Oportunidad"}
                        </h2>
                        <p className="text-base text-gray-500 mt-1">
                            Describe lo que necesitas. Los profesionales te contactarán con sus propuestas.
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <div className="p-8 space-y-8">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                    <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={24} />
                    <div className="text-base text-blue-800">
                        <strong>¿Qué es una Oportunidad?</strong> Es cuando necesitas un servicio y quieres que los profesionales te encuentren. 
                        Escribe qué necesitas, tu precio y cuándo lo necesitas.
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Title */}
                    <div className="col-span-1 lg:col-span-2 space-y-3">
                        <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Search size={18} /> ¿Qué necesitas? *
                        </label>
                        <Input
                            name="titulo"
                            placeholder="Ej: Necesito desarrollar una tienda online para mi negocio"
                            value={formData.titulo}
                            onChange={handleInputChange}
                            className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-lg px-4"
                        />
                    </div>

                    {/* Category */}
                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                <Tag size={18} /> Categoría *
                            </label>
                            <Select 
                                value={formData.categoria} 
                                onValueChange={handleCategoryGroupChange}
                                disabled={categoriesLoading}
                            >
                                <SelectTrigger className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white text-base">
                                    <SelectValue placeholder={categoriesLoading ? "Cargando..." : "Seleccionar área..."} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {categoryGroups.length > 0 ? (
                                        categoryGroups.map((group) => (
                                            <SelectItem key={group} value={group} className="cursor-pointer py-3">
                                                {group}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-4 text-base text-gray-500 text-center">
                                            No hay categorías disponibles
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                <Tag size={18} /> Subcategoría
                            </label>
                            <Select 
                                value={formData.subcategoria || ""} 
                                onValueChange={handleSubcategoryChange}
                                disabled={!formData.categoria || categoriesLoading}
                            >
                                <SelectTrigger className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white text-base">
                                    <SelectValue placeholder={!formData.categoria ? "Selecciona primero un área" : "Seleccionar..."} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {availableSubcategories.length > 0 ? (
                                        availableSubcategories.map((cat) => (
                                            <SelectItem key={cat.id_Categoria} value={cat.id_Categoria.toString()} className="cursor-pointer py-3">
                                                {cat.nombre}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-4 text-base text-gray-500 text-center">
                                            No hay subcategorías disponibles
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Price & Time */}
                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                <DollarSign size={18} /> Presupuesto (COP) *
                            </label>
                            <Input
                                name="precio"
                                type="number"
                                placeholder="Ej: 500000"
                                value={formData.precio}
                                onChange={handleInputChange}
                                className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono text-lg"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                <Clock size={18} /> ¿Cuándo lo necesitas?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    name="tiempo_entrega_num"
                                    placeholder="Número"
                                    value={formData.tiempo_entrega_num}
                                    onChange={(e) => {
                                        const num = e.target.value;
                                        const unidad = formData.tiempo_entrega_unidad;
                                        const value = num ? `${num} ${unidad}` : "";
                                        setFormData(prev => ({ ...prev, tiempo_entrega: value, tiempo_entrega_num: num }));
                                    }}
                                    className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-center text-lg"
                                />
                                <select
                                    name="tiempo_entrega_unidad"
                                    value={formData.tiempo_entrega_unidad}
                                    onChange={(e) => {
                                        const unidad = e.target.value;
                                        const num = formData.tiempo_entrega_num || "1";
                                        setFormData(prev => ({ ...prev, tiempo_entrega: `${num} ${unidad}`, tiempo_entrega_unidad: unidad }));
                                    }}
                                    className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-base px-4"
                                >
                                    <option value="Días">Días</option>
                                    <option value="Semanas">Semanas</option>
                                    <option value="Meses">Meses</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Urgency & Location */}
                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                <AlertCircle size={18} /> Nivel de urgencia
                            </label>
                            <Select 
                                value={formData.urgencia} 
                                onValueChange={(value) => setFormData(prev => ({ ...prev, urgencia: value }))}
                            >
                                <SelectTrigger className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-base">
                                    <SelectValue placeholder="Seleccionar urgencia..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {urgencyOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value} className="py-3">
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin size={18} /> Ubicación
                            </label>
                            <Input
                                name="ubicacion"
                                placeholder="Ej: Bogotá, Chapinero"
                                value={formData.ubicacion}
                                onChange={handleInputChange}
                                className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-base"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-1 lg:col-span-2 space-y-3">
                        <label className="text-base font-semibold text-gray-700">
                            Descripción detallada de tu necesidad
                        </label>
                        <Textarea
                            name="descripcion"
                            placeholder="Describe con detalle qué necesitas, qué esperas del servicio, cualquier requisito específico..."
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            className="min-h-40 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-y text-base p-4"
                        />
                    </div>

                    {/* Modo de Trabajo */}
                    <div className="col-span-1 lg:col-span-2 space-y-3">
                        <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Globe size={18} /> Modo de Trabajo *
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { value: 'virtual', label: 'Virtual', desc: 'Trabajo en línea' },
                                { value: 'presencial', label: 'Presencial', desc: 'Trabajo físico' },
                                { value: 'mixto', label: 'Mixto', desc: 'Virtual y presencial' },
                            ].map((modo) => (
                                <label
                                    key={modo.value}
                                    className={`
                                        relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${formData.modo_trabajo === modo.value 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="modo_trabajo"
                                        value={modo.value}
                                        checked={formData.modo_trabajo === modo.value}
                                        onChange={(e) => setFormData({ ...formData, modo_trabajo: e.target.value })}
                                        className="sr-only"
                                    />
                                    <span className={`font-semibold ${formData.modo_trabajo === modo.value ? 'text-blue-600' : 'text-gray-700'}`}>
                                        {modo.label}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">{modo.desc}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Métodos de Pago */}
                    <div className="col-span-1 lg:col-span-2 space-y-3">
                        <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <CreditCard size={18} /> Métodos de Pago Aceptados
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: 'tarjeta', label: 'Tarjeta' },
                                { value: 'nequi', label: 'Nequi' },
                                { value: 'bancolombia_qr', label: 'QR Bancolombia' },
                                { value: 'efectivo', label: 'Efectivo' },
                            ].map((metodo) => (
                                <label
                                    key={metodo.value}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                                        ${(formData.metodos_pago || []).includes(metodo.value) 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <input
                                        type="checkbox"
                                        value={metodo.value}
                                        checked={(formData.metodos_pago || []).includes(metodo.value)}
                                        onChange={(e) => {
                                            const current = formData.metodos_pago || [];
                                            const nuevos = e.target.checked
                                                ? [...current, metodo.value]
                                                : current.filter(m => m !== metodo.value);
                                            setFormData({ ...formData, metodos_pago: nuevos });
                                        }}
                                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{metodo.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Image */}
                    <div className="col-span-1 lg:col-span-2 space-y-4">
                        <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <ImageIcon size={18} /> Imagen de referencia (opcional)
                        </label>
                        <div className="group relative w-full h-56 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer overflow-hidden">
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
                                        <span className="bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2">
                                            <Upload size={18} /> Cambiar
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                        <Upload size={28} className="text-blue-500" />
                                    </div>
                                    <p className="font-medium text-gray-600 text-base">Ej: Foto del problema o ejemplo</p>
                                    <p className="text-sm">Max 2MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex flex-col-reverse sm:flex-row gap-4">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="h-14 px-8 rounded-xl hover:bg-gray-200 text-gray-600 font-medium text-base"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-14 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-semibold text-base min-w-48"
                >
                    {submitting ? (
                        <Loader2 className="animate-spin mr-2" />
                    ) : (
                        <>{editingOpportunity ? "Guardar Cambios" : "Publicar Oportunidad"}</>
                    )}
                </Button>
            </div>
        </div>
    );
}
