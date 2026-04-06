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
    Globe,
    CreditCard,
    CheckCircle,
    FileText,
    Settings,
    ImagePlus,
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
import { showSuccess, showError, showInfo } from "../../utils/swalHelpers";

// Step indicator component
function StepIndicator({ currentStep, steps }) {
    return (
        <div className="flex items-center justify-center gap-2 md:gap-0 mb-8">
            {steps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;
                
                return (
                    <div key={index} className="flex items-center">
                        {/* Step circle */}
                        <div className={`
                            flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold
                            transition-all duration-300
                            ${isCompleted 
                                ? 'bg-blue-600 text-white' 
                                : isActive 
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                                    : 'bg-gray-200 text-gray-500'
                            }
                        `}>
                            {isCompleted ? <CheckCircle size={18} /> : stepNum}
                        </div>
                        
                        {/* Step label - hidden on mobile */}
                        <span className={`
                            hidden md:block ml-2 text-sm font-medium
                            ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                        `}>
                            {step}
                        </span>
                        
                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className={`
                                hidden md:block w-8 md:w-16 h-0.5 mx-2
                                ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}
                            `} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Section header component
function SectionHeader(props) {
    const { icon: Icon, title, description } = props;
    return (
        <div className="flex items-start gap-3 mb-4 pt-4">
            <div className="bg-blue-50 p-2 rounded-lg">
                <Icon className="text-blue-600" size={20} />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
        </div>
    );
}

// Helper text component
function HelperText({ children }) {
    return <p className="text-xs text-gray-500 mt-1.5 ml-0.5">{children}</p>;
}

// Price input with formatting
function PriceInput({ value, onChange, name, placeholder }) {
    const formatNumber = (num) => {
        if (!num) return "";
        return new Intl.NumberFormat('es-CO').format(num);
    };

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/[^\d]/g, '');
        onChange({ target: { name, value: rawValue } });
    };

    return (
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-500">
                <span className="text-lg font-medium">COP</span>
                <span className="w-px h-5 bg-gray-300" />
            </div>
            <Input
                name={name}
                type="text"
                placeholder={placeholder}
                value={formatNumber(value)}
                onChange={handleChange}
                className="h-14 pl-20 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono text-lg"
            />
        </div>
    );
}

// Time input with unit selector
function TimeInput({ numValue, unitValue, onNumChange, onUnitChange }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <Input
                type="number"
                placeholder="Cantidad"
                value={numValue}
                onChange={(e) => onNumChange(e.target.value)}
                className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-center text-lg"
                min="1"
            />
            <Select value={unitValue} onValueChange={onUnitChange}>
                <SelectTrigger className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-base">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Días">Días</SelectItem>
                    <SelectItem value="Semanas">Semanas</SelectItem>
                    <SelectItem value="Meses">Meses</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

// Image upload component
function ImageUpload({ preview, onChange, accept = "image/*", maxSize = "2MB", example }) {
    const [fileInfo, setFileInfo] = useState(null);

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileInfo({
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB"
            });
            onChange(e);
        }
    };

    return (
        <div className="space-y-4">
            <div className="group relative w-full min-h-64 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-all cursor-pointer overflow-hidden">
                <input
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            <span className="bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2">
                                <Upload size={18} /> Cambiar imagen
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <div className="bg-white p-5 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                            <ImagePlus size={36} className="text-blue-500" />
                        </div>
                        <p className="font-semibold text-gray-600 text-base mb-1">Arrastra tu imagen aquí</p>
                        <p className="text-sm text-gray-400 mb-2">o haz clic para seleccionar</p>
                        <p className="text-xs text-gray-400">Formato: JPG, PNG • Máximo {maxSize}</p>
                        {example && <p className="text-xs text-blue-500 mt-2">{example}</p>}
                    </div>
                )}
            </div>
            
            {/* File info display */}
            {fileInfo && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <ImageIcon className="text-blue-600" size={20} />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{fileInfo.name}</p>
                        <p className="text-xs text-gray-500">{fileInfo.size}</p>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setFileInfo(null);
                            onChange({ target: { files: [null], value: '' } });
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}

export default function FormService({ onCancel, onSuccess, editingService = null, categories: initialCategories = [] }) {
    const [currentStep] = useState(1);
    const [categories, setCategories] = useState(initialCategories);
    const [categoriesLoading, setCategoriesLoading] = useState(initialCategories.length === 0);
    const [submitting, setSubmitting] = useState(false);

    const steps = ["Información básica", "Detalles", "Configuración", "Imagen"];

    const [formData, setFormData] = useState({
        titulo: editingService?.titulo || "",
        descripcion: editingService?.descripcion || "",
        categoria: "",
        subcategoria: editingService?.id_Categoria?.toString() || "",
        precio: editingService?.precio?.toString() || "",
        imagen: null,
        modo_trabajo: editingService?.modo_trabajo || "",
        metodos_pago: editingService?.metodos_pago || ["tarjeta", "efectivo"],
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

    useEffect(() => {
        if (editingService && categories.length > 0 && !formData.categoria) {
            const idCategoria = editingService.id_Categoria;
            const categoriaEncontrada = categories.find(
                cat => cat && cat.id_Categoria === idCategoria
            );
            if (categoriaEncontrada && categoriaEncontrada.grupo) {
                setFormData(prev => ({ ...prev, categoria: categoriaEncontrada.grupo }));
            }
        }
    }, [editingService, categories]);

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
            showInfo('Campos requeridos', 'Por favor completa el título, precio, selecciona una subcategoría y el modo de trabajo.');
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
            formDataToSend.append("tipo", "servicio");
            formDataToSend.append("modo_trabajo", formData.modo_trabajo);
            formDataToSend.append("metodos_pago", JSON.stringify(formData.metodos_pago || []));
            
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
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
                }
                throw new Error(data.message || "Error al guardar el servicio");
            }

            showSuccess(editingService ? 'Servicio actualizado' : 'Servicio creado', editingService 
                    ? 'Tu servicio ha sido actualizado correctamente.' 
                    : 'Tu servicio ha sido publicado correctamente.');

            if (onSuccess) onSuccess();
        } catch (error) {
            showError('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
            {/* Header */}
            <div className="px-6 md:px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="p-2.5 hover:bg-gray-100 rounded-xl"
                    >
                        <ArrowLeft size={22} className="text-gray-600" />
                    </Button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {editingService ? 
                                <Edit className="text-blue-600" /> : 
                                <Package className="text-blue-600" />
                            }
                            {editingService ? "Editar Servicio" : "Publicar Nuevo Servicio"}
                        </h2>
                        <p className="text-sm md:text-base text-gray-500 mt-1">
                            Describe tu servicio profesional para atraer clientes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="px-6 md:px-8 pt-6 pb-2 border-b border-gray-100">
                <StepIndicator currentStep={currentStep} steps={steps} />
            </div>

            {/* Formulario */}
            <div className="p-6 md:p-8 space-y-8">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                    <Package className="text-blue-600 shrink-0 mt-0.5" size={24} />
                    <div className="text-sm md:text-base text-blue-800">
                        <strong>¿Qué es un servicio?</strong> Es cuando ofreces tus habilidades y servicios profesionales. 
                        Escribe qué haces, tu experiencia y el precio de tu trabajo.
                    </div>
                </div>

                {/* STEP 1: Información básica */}
                <div className="space-y-6">
                    <SectionHeader 
                        icon={FileText} 
                        title="Información del servicio" 
                        description="Datos principales para identificar tu servicio"
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="col-span-1 lg:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Tag size={16} /> Título del Servicio *
                            </label>
                            <Input
                                name="titulo"
                                placeholder="Ej: Diseño de UI/UX para App Móvil"
                                value={formData.titulo}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-base"
                            />
                            <HelperText>Un título claro y descriptivo ayuda a los clientes a encontrarte</HelperText>
                        </div>

                        {/* Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 lg:col-span-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Tag size={16} /> Categoría *
                                </label>
                                <Select 
                                    value={formData.categoria} 
                                    onValueChange={handleCategoryGroupChange}
                                    disabled={categoriesLoading}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white text-base">
                                        <SelectValue placeholder={categoriesLoading ? "Cargando..." : "Seleccionar área..."} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {categoryGroups.length > 0 ? (
                                            categoryGroups.map((group) => (
                                                <SelectItem key={group} value={group} className="cursor-pointer py-2.5">
                                                    {group}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-3 text-sm text-gray-500 text-center">
                                                No hay categorías disponibles
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Tag size={16} /> Subcategoría
                                </label>
                                <Select 
                                    value={formData.subcategoria || ""} 
                                    onValueChange={handleSubcategoryChange}
                                    disabled={!formData.categoria || categoriesLoading}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white text-base">
                                        <SelectValue placeholder={!formData.categoria ? "Selecciona primero un área" : "Seleccionar..."} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {availableSubcategories.length > 0 ? (
                                            availableSubcategories.map((cat) => (
                                                <SelectItem key={cat.id_Categoria} value={cat.id_Categoria.toString()} className="cursor-pointer py-2.5">
                                                    {cat.nombre}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-3 text-sm text-gray-500 text-center">
                                                No hay subcategorías disponibles
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <HelperText>Selecciona una categoría para ver las subcategorías disponibles</HelperText>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STEP 2: Precio y entrega */}
                <div className="space-y-6">
                    <div className="h-px bg-gray-200" />
                    <SectionHeader 
                        icon={DollarSign} 
                        title="Precio y tiempo de entrega" 
                        description="Define cuánto cobras y cuánto tiempo necesitas"
                    />
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <DollarSign size={16} /> Precio (COP) *
                        </label>
                        <PriceInput
                            name="precio"
                            value={formData.precio}
                            onChange={handleInputChange}
                            placeholder="Ej: 500.000"
                        />
                        <HelperText>Precio sin puntos ni comas. Ejemplo: 500000</HelperText>
                    </div>
                </div>

                {/* STEP 3: Configuración */}
                <div className="space-y-6">
                    <div className="h-px bg-gray-200" />
                    <SectionHeader 
                        icon={Settings} 
                        title="Configuración" 
                        description="Cómo trabajarás y cómo recibirás pagos"
                    />
                    
                    {/* Modo de Trabajo */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Globe size={16} /> Modo de Trabajo *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'virtual', label: 'Virtual', desc: 'Trabajo en línea' },
                                { value: 'presencial', label: 'Presencial', desc: 'Trabajo físico' },
                                { value: 'mixto', label: 'Mixto', desc: 'Virtual y presencial' },
                            ].map((modo) => (
                                <label
                                    key={modo.value}
                                    className={`
                                        relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all
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
                                    <span className={`font-medium text-sm ${formData.modo_trabajo === modo.value ? 'text-blue-600' : 'text-gray-700'}`}>
                                        {modo.label}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-0.5 text-center hidden md:block">{modo.desc}</span>
                                </label>
                            ))}
                        </div>
                        <HelperText>¿Cómo prefieres realizar el trabajo?</HelperText>
                    </div>

                    {/* Métodos de Pago */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CreditCard size={16} /> Métodos de Pago Aceptados
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
                                        flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all
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
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{metodo.label}</span>
                                </label>
                            ))}
                        </div>
                        <HelperText>Selecciona los métodos de pago que aceptas</HelperText>
                    </div>
                </div>

                {/* Description - separate section */}
                <div className="space-y-6">
                    <div className="h-px bg-gray-200" />
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">
                            Descripción del Servicio
                        </label>
                        <Textarea
                            name="descripcion"
                            placeholder="Describe qué incluye tu servicio, metodología, entregables, experiencia..."
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            className="min-h-32 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-y text-base p-4"
                        />
                        <HelperText>Cuéntales a los clientes qué incluye tu servicio y qué pueden esperar</HelperText>
                    </div>
                </div>

                {/* STEP 4: Imagen */}
                <div className="space-y-6">
                    <div className="h-px bg-gray-200" />
                    <SectionHeader 
                        icon={ImagePlus} 
                        title="Imagen de portada" 
                        description="Una imagen llama más la atención que mil palabras"
                    />
                    <ImageUpload
                        preview={previewImage}
                        onChange={handleImageChange}
                        maxSize="2MB"
                        example="Ej: Portfolio o trabajo realizado"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 md:px-8 py-5 border-t border-gray-200 bg-gray-50 flex flex-col-reverse sm:flex-row gap-3">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="h-12 px-6 rounded-xl hover:bg-gray-200 text-gray-600 font-medium text-base"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-semibold text-base min-w-44"
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