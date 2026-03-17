import { useState, useEffect, useMemo } from "react";
import {
    ArrowLeft,
    Edit,
    Package,
    Upload,
    DollarSign,
    Clock,
    Tag,
    Image as ImageIcon,
    Loader2,
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

export default function FormService({ onCancel, onSuccess, editingService = null, categories: initialCategories = [] }) {
    const [categories, setCategories] = useState(initialCategories);
    const [categoriesLoading, setCategoriesLoading] = useState(initialCategories.length === 0);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        titulo: editingService?.titulo || "",
        descripcion: editingService?.descripcion || "",
        categoria: "",
        subcategoria: editingService?.id_Categoria?.toString() || "",
        precio: editingService?.precio?.toString() || "",
        tiempo_entrega: editingService?.tiempo_entrega || "",
        tiempo_entrega_num: editingService?.tiempo_entrega ? editingService.tiempo_entrega.split(" ")[0] : "",
        tiempo_entrega_unidad: editingService?.tiempo_entrega ? editingService.tiempo_entrega.split(" ")[1] || "Días" : "Días",
        imagen: null,
    });

    const [previewImage, setPreviewImage] = useState(editingService?.imagen || null);

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
            
            formDataToSend.append("titulo", formData.titulo);
            formDataToSend.append("descripcion", formData.descripcion);
            formDataToSend.append("id_Categoria", idCategoria);
            formDataToSend.append("precio", formData.precio);
            formDataToSend.append("tiempo_entrega", formData.tiempo_entrega);
            formDataToSend.append("tipo", "servicio");
            
            if (formData.imagen && typeof formData.imagen !== 'string') {
                formDataToSend.append("imagen", formData.imagen);
            }

            const url = editingService 
                ? `${API_URL}/servicios/${editingService.id_Servicio}`
                : `${API_URL}/servicios`;
            
            const response = await fetch(url, {
                method: editingService ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
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
                            {editingService ? 
                                <Edit className="text-blue-600" /> : 
                                <Package className="text-blue-600" />
                            }
                            {editingService ? "Editar Servicio" : "Publicar Nuevo Servicio"}
                        </h2>
                        <p className="text-base text-gray-500 mt-1">
                            Describe tu servicio profesional para atraer clientes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <div className="p-8 space-y-8">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                    <Package className="text-blue-600 shrink-0 mt-0.5" size={24} />
                    <div className="text-base text-blue-800">
                        <strong>¿Qué es un servicio?</strong> Es cuando ofreces tus habilidades y servicios profesionales. 
                        Escribe qué haces, tu experiencia y el precio de tu trabajo.
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Title */}
                    <div className="col-span-1 lg:col-span-2 space-y-3">
                        <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Tag size={18} /> Título del Servicio *
                        </label>
                        <Input
                            name="titulo"
                            placeholder="Ej: Diseño de UI/UX para App Móvil"
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

                    {/* Price */}
                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                <DollarSign size={18} /> Precio (COP) *
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
                                <Clock size={18} /> Tiempo de Entrega
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

                    {/* Description */}
                    <div className="col-span-1 lg:col-span-2 space-y-3">
                        <label className="text-base font-semibold text-gray-700">
                            Descripción del Servicio
                        </label>
                        <Textarea
                            name="descripcion"
                            placeholder="Describe qué incluye tu servicio, metodología, entregables..."
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            className="min-h-40 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-y text-base p-4"
                        />
                    </div>

                    {/* Image */}
                    <div className="col-span-1 lg:col-span-2 space-y-4">
                        <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <ImageIcon size={18} /> Imagen de Portada (opcional)
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
                                    <p className="font-medium text-gray-600 text-base">Ej: Portfolio o trabajo realizado</p>
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
                        <>{editingService ? "Guardar Cambios" : "Publicar Servicio"}</>
                    )}
                </Button>
            </div>
        </div>
    );
}
