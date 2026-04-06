import { Briefcase, Package } from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function ProfileServices({ servicesOffered, onNavigate }) {
    if (servicesOffered.length > 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Servicios Ofrecidos</h3>
                        <p className="text-sm text-gray-500 mt-1">Gestiona tus servicios publicados</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {servicesOffered.length} servicio{servicesOffered.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="grid gap-4">
                    {servicesOffered.map((service) => (
                        <div key={service.id_Servicio} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-100/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                    <Briefcase className="text-blue-600" size={22} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{service.titulo}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                        {service.categoria?.nombre || "Sin categoría"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-blue-600 text-lg">
                                    ${Number(service.precio || 0).toLocaleString("es-CO")}
                                </p>
                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                    service.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${service.estado === 'Activo' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    {service.estado || "Activo"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Servicios Ofrecidos</h3>
                <p className="text-sm text-gray-500 mt-1">Gestiona tus servicios publicados</p>
            </div>
            <div className="text-center py-16 px-8">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package size={36} className="text-gray-300" />
                </div>
                <h4 className="text-gray-900 font-semibold mb-2">No has creado servicios todavía</h4>
                <p className="text-gray-500 mb-6">Crea tu primer servicio para comenzar a recibir clientes</p>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => onNavigate && onNavigate('create-service')}>
                    <Briefcase size={16} />
                    Crear Servicio
                </Button>
            </div>
        </div>
    );
}
