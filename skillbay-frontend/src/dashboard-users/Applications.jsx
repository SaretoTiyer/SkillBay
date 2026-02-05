import { useState } from 'react';
import {
FileText,
Calendar,
DollarSign,
User,
CheckCircle,
XCircle,
Clock
} from 'lucide-react';

import { Badge } from '../components/ui/badge';
import { Button } from "../components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function Applications() {
const [applications] = useState([
    {
    id: 1,
    projectTitle: 'Desarrollo de E-commerce',
    projectDescription: 'Necesito desarrollar una tienda online completa con carrito de compras y pasarela de pago',
    client: 'TechStore Colombia',
    budget: '$2,000,000',
    appliedDate: '2024-10-25',
    status: 'pending',
    proposalMessage: 'Tengo 5 años de experiencia en desarrollo de e-commerce con React y Node.js...',
    image: 'https://images.unsplash.com/photo-1593720213681-e9a8778330a7',
    },
    {
    id: 2,
    projectTitle: 'Rediseño de Aplicación Móvil',
    projectDescription: 'Busco diseñador UI/UX para rediseñar completamente nuestra app móvil',
    client: 'FitnessPro App',
    budget: '$1,200,000',
    appliedDate: '2024-10-23',
    status: 'hired',
    proposalMessage: 'Me especializo en diseño UI/UX para aplicaciones móviles...',
    image: 'https://images.unsplash.com/photo-1740174459726-8c57d8366061',
    },
    {
    id: 3,
    projectTitle: 'Campaña de Marketing Digital',
    projectDescription: 'Necesito especialista en marketing para campaña en redes sociales',
    client: 'Café Gourmet',
    budget: '$900,000',
    appliedDate: '2024-10-20',
    status: 'rejected',
    proposalMessage: 'He trabajado con marcas de alimentos y bebidas...',
    image: 'https://images.unsplash.com/photo-1754926982324-1d874274d7c6',
    },
]);

const getStatusBadge = (status) => {
    if (status === 'pending') {
    return (
        <Badge className="bg-yellow-500 text-white flex gap-1">
        <Clock size={14} /> Pendiente
        </Badge>
    );
    }

    if (status === 'hired') {
    return (
        <Badge className="bg-green-500 text-white flex gap-1">
        <CheckCircle size={14} /> Contratado
        </Badge>
    );
    }

    return (
    <Badge className="bg-red-500 text-white flex gap-1">
        <XCircle size={14} /> Denegado
    </Badge>
    );
};

const getStatusColor = (status) => {
    if (status === 'pending') return 'border-l-yellow-500';
    if (status === 'hired') return 'border-l-green-500';
    return 'border-l-red-500';
};

const pending = applications.filter(a => a.status === 'pending');
const hired = applications.filter(a => a.status === 'hired');
const rejected = applications.filter(a => a.status === 'rejected');

const ApplicationCard = ({ application }) => (
    <div className={`bg-white rounded-2xl shadow-lg border-l-4 ${getStatusColor(application.status)} overflow-hidden`}>
    <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <div className="h-48 md:h-auto">
        <ImageWithFallback
            src={application.image}
            alt={application.projectTitle}
            className="w-full h-full object-cover"
        />
        </div>

        <div className="p-6">
        <div className="flex justify-between mb-3">
            <div>
            <h3 className="text-[#1E3A5F]">{application.projectTitle}</h3>
            <p className="text-[#A0AEC0] line-clamp-2">{application.projectDescription}</p>
            </div>
            {getStatusBadge(application.status)}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-[#A0AEC0]">
            <div className="flex gap-2"><User size={16} /> {application.client}</div>
            <div className="flex gap-2"><DollarSign size={16} /> {application.budget}</div>
            <div className="flex gap-2 col-span-2">
            <Calendar size={16} />
            Postulado el {new Date(application.appliedDate).toLocaleDateString('es-CO')}
            </div>
        </div>

        <div className="bg-gray-100 rounded-xl p-4 mb-4">
            <h4 className="text-sm text-[#1E3A5F] mb-1">Tu propuesta</h4>
            <p className="text-sm text-[#A0AEC0] line-clamp-2">{application.proposalMessage}</p>
        </div>

        <div className="flex gap-2">
            <Button variant="outline">Ver Detalles</Button>

            {application.status === 'pending' && (
            <Button variant="outline">Editar Propuesta</Button>
            )}

            {application.status === 'hired' && (
            <Button className="bg-green-600 text-white">Ir al Proyecto</Button>
            )}
        </div>
        </div>
    </div>
    </div>
);

return (
    <div className="max-w-7xl mx-auto">
    <h1 className="text-[#1E3A5F] mb-6">Mis Postulaciones</h1>

    <Tabs defaultValue="all">
        <TabsList>
        <TabsTrigger value="all">Todas ({applications.length})</TabsTrigger>
        <TabsTrigger value="pending">Pendientes ({pending.length})</TabsTrigger>
        <TabsTrigger value="hired">Contratadas ({hired.length})</TabsTrigger>
        <TabsTrigger value="rejected">Denegadas ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
        {applications.map(app => (
            <ApplicationCard key={app.id} application={app} />
        ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
        {pending.map(app => (
            <ApplicationCard key={app.id} application={app} />
        ))}
        </TabsContent>

        <TabsContent value="hired" className="space-y-6">
        {hired.map(app => (
            <ApplicationCard key={app.id} application={app} />
        ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
        {rejected.map(app => (
            <ApplicationCard key={app.id} application={app} />
        ))}
        </TabsContent>
    </Tabs>
    </div>
);
}
