import { useState } from "react";
import {
Search,
Filter,
MapPin,
DollarSign,
Clock,
Star,
TrendingUp,
Briefcase,
} from "lucide-react";

export default function ExploreOpportunities() {
const [searchQuery, setSearchQuery] = useState("");
const [selectedCategory, setSelectedCategory] = useState("all");
const [selectedType, setSelectedType] = useState("all");
const [showFilters, setShowFilters] = useState(false);

const categories = [
    "Todos",
    "Desarrollo Web",
    "Diseño Gráfico",
    "Marketing Digital",
    "Redacción",
    "Fotografía",
    "Video",
    "Consultoría",
];

const opportunities = [
    {
    id: 1,
    title: "Curso de programación web",
    description:
        "Necesito desarrollador para crear curso completo de programación web con ejercicios prácticos",
    type: "solicitud",
    category: "Desarrollo Web",
    budget: "$500,000 - $800,000",
    location: "Bogotá, Colombia",
    timePosted: "Hace 2 horas",
    proposals: 5,
    rating: 4.8,
    image:
        "https://images.unsplash.com/photo-1593720213681-e9a8778330a7?auto=format&fit=crop&w=1080&q=80",
    tags: ["React", "Node.js", "JavaScript"],
    client: "TechAcademy Co.",
    },
    {
    id: 2,
    title: "Diseño de logo para startup",
    description:
        "Busco diseñador creativo para crear identidad de marca completa para startup tecnológica",
    type: "solicitud",
    category: "Diseño Gráfico",
    budget: "$300,000 - $500,000",
    location: "Medellín, Colombia",
    timePosted: "Hace 5 horas",
    proposals: 12,
    rating: 4.9,
    image:
        "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1080&q=80",
    tags: ["Adobe Illustrator", "Branding", "Diseño"],
    client: "InnovateTech",
    },
    {
    id: 3,
    title: "Traducción de documentos técnicos",
    description:
        "Ofrezco servicios de traducción inglés-español para documentación técnica y manuales",
    type: "oferta",
    category: "Redacción",
    budget: "$50,000 - $150,000",
    location: "Remoto",
    timePosted: "Hace 1 día",
    proposals: 3,
    rating: 5.0,
    image:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=1080&q=80",
    tags: ["Traducción", "Inglés", "Técnico"],
    client: "María González",
    },
];

const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
    opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
    selectedCategory === "all" || opp.category === selectedCategory;
    const matchesType = selectedType === "all" || opp.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
});

return (
    <div className="max-w-7xl mx-auto px-4 py-10">
    {/* Header */}
    <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-linear-to-br from-[#2B6CB0] to-[#1E3A5F] rounded-xl">
        <TrendingUp className="text-white" size={28} />
        </div>
        <div>
        <h1 className="text-2xl font-bold text-[#1E3A5F]">
            Explorar Oportunidades
        </h1>
        <p className="text-[#A0AEC0] mt-1">
            Descubre proyectos y servicios disponibles
        </p>
        </div>
    </div>

    {/* Search & Filters */}
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#E2E8F0]">
        {/* Search */}
        <div className="relative mb-4">
        <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A0AEC0]"
            size={20}
        />
        <input
            type="text"
            placeholder="Buscar oportunidades, servicios, habilidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#f7fafc] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B6CB0] transition-all"
        />
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
        {["all", "solicitud", "oferta"].map((type) => (
            <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg capitalize transition-all ${
                selectedType === type
                ? "bg-linear-to-r from-[#2B6CB0] to-[#1E3A5F] text-white shadow-lg"
                : "bg-[#E2E8F0] text-[#1E3A5F] hover:bg-[#d0dae6]"
            }`}
            >
            {type === "all" ? "Todas" : type}
            </button>
        ))}

        <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-auto px-4 py-2 bg-[#E2E8F0] text-[#1E3A5F] rounded-lg hover:bg-[#d0dae6] flex items-center gap-2 transition-all"
        >
            <Filter size={18} />
            Filtros
        </button>
        </div>

        {/* Category Filters */}
        {showFilters && (
        <div className="pt-4 border-t border-[#E2E8F0]">
            <h4 className="mb-3 text-[#1E3A5F] font-semibold">Categorías</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {categories.map((category) => (
                <button
                key={category}
                onClick={() =>
                    setSelectedCategory(
                    category === "Todos" ? "all" : category
                    )
                }
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    (category === "Todos" && selectedCategory === "all") ||
                    selectedCategory === category
                    ? "bg-[#2B6CB0] text-white"
                    : "bg-[#f7fafc] text-[#1E3A5F] hover:bg-[#E2E8F0]"
                }`}
                >
                {category}
                </button>
            ))}
            </div>
        </div>
        )}
    </div>

    {/* Results */}
    <p className="text-[#A0AEC0] mb-4">
        Mostrando {filteredOpportunities.length} oportunidades
    </p>

    {/* Cards Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpportunities.map((opp) => (
        <div
            key={opp.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0] hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
        >
            <div className="relative h-48">
            <img
                src={opp.image}
                alt={opp.title}
                className="w-full h-full object-cover"
            />
            <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${
                opp.type === "oferta"
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white"
                }`}
            >
                {opp.type === "oferta" ? "Oferta" : "Solicitud"}
            </span>
            </div>

            <div className="p-6">
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-[#1E3A5F] font-semibold text-lg">
                {opp.title}
                </h3>
                <div className="flex items-center gap-1 text-yellow-500">
                <Star size={16} fill="currentColor" />
                <span className="text-sm text-[#1E3A5F]">{opp.rating}</span>
                </div>
            </div>

            <p className="text-[#A0AEC0] mb-3">{opp.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                {opp.tags.map((tag, i) => (
                <span
                    key={i}
                    className="px-3 py-1 bg-[#E2E8F0] text-[#1E3A5F] rounded-full text-xs"
                >
                    {tag}
                </span>
                ))}
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm text-[#A0AEC0] mb-4">
                <div className="flex items-center gap-2">
                <DollarSign size={16} /> {opp.budget}
                </div>
                <div className="flex items-center gap-2">
                <MapPin size={16} /> {opp.location}
                </div>
                <div className="flex items-center gap-2">
                <Clock size={16} /> {opp.timePosted}
                </div>
                <div className="flex items-center gap-2">
                <Briefcase size={16} /> {opp.proposals} propuestas
                </div>
            </div>

            {/* Client */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2B6CB0] to-[#1E3A5F] flex items-center justify-center text-white text-sm font-medium">
                    {opp.client.charAt(0)}
                </div>
                <span className="text-sm text-[#1E3A5F]">{opp.client}</span>
                </div>
                <button className="px-4 py-2 bg-linear-to-r from-[#2B6CB0] to-[#1E3A5F] text-white rounded-lg hover:from-[#1e5a94] hover:to-[#1E3A5F] transition-all">
                Ver Detalles
                </button>
            </div>
            </div>
        </div>
        ))}
    </div>

    {/* Empty State */}
    {filteredOpportunities.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-[#E2E8F0]">
        <Briefcase className="mx-auto mb-4 text-[#A0AEC0]" size={64} />
        <h3 className="text-[#1E3A5F] mb-2">
            No se encontraron oportunidades
        </h3>
        <p className="text-[#A0AEC0]">
            Intenta ajustar los filtros de búsqueda
        </p>
        </div>
    )}
    </div>
);
}
