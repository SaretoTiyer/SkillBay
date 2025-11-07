import { ArrowRight, Laptop, Home, BookOpen, Wrench, PartyPopper, Hammer, Sparkles, CheckCircle, Clock, Users } from 'lucide-react';


export default function Services({ onNavigate }) {
const serviceCategories = [
    {
    title: 'Tecnología',
    description: 'Desarrollo web, diseño gráfico, soporte técnico, programación y más.',
    icon: Laptop,
    image: 'https://images.unsplash.com/photo-1758691462519-99076ad0d485?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: 'from-blue-500 to-blue-600',
    services: ['Desarrollo Web', 'Diseño Gráfico', 'Soporte Técnico', 'Marketing Digital'],
    },
    {
    title: 'Cuidado del Hogar',
    description: 'Limpieza, jardinería, plomería, electricidad y mantenimiento general.',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1686178827149-6d55c72d81df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: 'from-green-500 to-green-600',
    services: ['Limpieza', 'Jardinería', 'Plomería', 'Electricidad'],
    },
    {
    title: 'Educación',
    description: 'Tutorías, clases particulares, formación profesional y asesorías académicas.',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1608986596619-eb50cc56831f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: 'from-purple-500 to-purple-600',
    services: ['Tutorías', 'Idiomas', 'Música', 'Preparación Exámenes'],
    },
    {
    title: 'Servicios Generales',
    description: 'Consultoría, asesoría legal, contabilidad, traducción y más servicios profesionales.',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1738817628102-0b420c17dac3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: 'from-orange-500 to-orange-600',
    services: ['Consultoría', 'Asesoría Legal', 'Contabilidad', 'Traducción'],
    },
    {
    title: 'Eventos',
    description: 'Organización de eventos, catering, fotografía, animación y decoración.',
    icon: PartyPopper,
    image: 'https://images.unsplash.com/photo-1759477274116-e3cb02d2b9d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: 'from-pink-500 to-pink-600',
    services: ['Organización', 'Catering', 'Fotografía', 'Decoración'],
    },
    {
    title: 'Oficios Manuales',
    description: 'Carpintería, pintura, albañilería, reparaciones y trabajos artesanales.',
    icon: Hammer,
    image: 'https://images.unsplash.com/photo-1759523131742-af817477bcd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: 'from-yellow-500 to-yellow-600',
    services: ['Carpintería', 'Pintura', 'Albañilería', 'Reparaciones'],
    },
];

const steps = [
    { number: '01', title: 'Crea tu Cuenta', description: 'Regístrate gratis en menos de 2 minutos', icon: Users },
    { number: '02', title: 'Busca o Publica', description: 'Encuentra el servicio o publica tu oferta', icon: CheckCircle },
    { number: '03', title: 'Conecta y Trabaja', description: 'Conecta con profesionales verificados', icon: Clock },
];

return (
    <div className="min-h-screen pt-20">
    {/* --- Hero --- */}
    <section className="relative overflow-hidden bg-linear-to-br from-[#0f2744] via-[#1E3A5F] to-[#2B6CB0] text-white">
        <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#2B6CB0] rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#1E3A5F] rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <Sparkles className="text-yellow-300" size={18} />
            <span className="text-sm">Más de 6 categorías de servicios disponibles</span>
        </div>
        <h1 className="mb-6 bg-linear-to-r from-white via-white to-blue-100 bg-clip-text text-transparent">
            Categorías de Servicios
        </h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Explora nuestra amplia variedad de servicios profesionales.
        </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H0Z" fill="white"/>
        </svg>
        </div>
    </section>

    {/* --- Categorías --- */}
    <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceCategories.map((category, index) => {
            const Icon = category.icon;
            return (
            <div key={index} className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl border-2 border-gray-200 transition-all hover:-translate-y-2">
                <div className="relative h-56">
                <img src={category.image} alt={category.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-linear-to-t ${category.color} opacity-60`}></div>
                <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-xl shadow-lg">
                    <Icon className="text-[#1E3A5F]" size={28} />
                </div>
                </div>
                <div className="p-8">
                <h3 className="text-[#1E3A5F] mb-3">{category.title}</h3>
                <p className="text-[#A0AEC0] mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                    {category.services.map((service, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-[#E2E8F0] text-[#1E3A5F] rounded-full text-sm">
                        {service}
                    </span>
                    ))}
                </div>
                <button className="w-full py-3 bg-linear-to-r from-[#2B6CB0] to-[#1e5a94] text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg">
                    <span>Explorar Servicios</span>
                    <ArrowRight size={18} />
                </button>
                </div>
            </div>
            );
        })}
        </div>
    </section>
    </div>
);
}
