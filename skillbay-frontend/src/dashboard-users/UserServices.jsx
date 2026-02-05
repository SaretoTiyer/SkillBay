import { useState } from 'react'
import {
Plus,
Edit,
Trash2,
Eye,
DollarSign,
Clock,
Star,
Package,
} from 'lucide-react'

import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/badge'
import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
DialogTrigger,
} from '../components/ui/dialog'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from '../components/ui/select'
import { ImageWithFallback } from '../components/figma/ImageWithFallback'

export default function UserServices() {
const [services, setServices] = useState([
    {
    id: 1,
    title: 'Desarrollo de Aplicación Web Completa',
    description:
        'Desarrollo de aplicaciones web modernas con React, Node.js y bases de datos',
    category: 'Desarrollo Web',
    price: '$1,500,000',
    deliveryTime: '2 semanas',
    status: 'active',
    views: 245,
    orders: 12,
    rating: 4.9,
    image:
        'https://images.unsplash.com/photo-1593720213681-e9a8778330a7',
    },
    {
    id: 2,
    title: 'Diseño UI/UX Profesional',
    description:
        'Diseño de interfaces modernas y funcionales para aplicaciones web y móviles',
    category: 'Diseño',
    price: '$800,000',
    deliveryTime: '1 semana',
    status: 'active',
    views: 189,
    orders: 8,
    rating: 5.0,
    image:
        'https://images.unsplash.com/photo-1740174459726-8c57d8366061',
    },
    {
    id: 3,
    title: 'Consultoría Técnica',
    description:
        'Asesoría en arquitectura de software y mejores prácticas de desarrollo',
    category: 'Consultoría',
    price: '$500,000',
    deliveryTime: '3 días',
    status: 'paused',
    views: 67,
    orders: 3,
    rating: 4.8,
    image:
        'https://images.unsplash.com/photo-1681366099753-f904192f17bb',
    },
])

const [isDialogOpen, setIsDialogOpen] = useState(false)
const [editingService, setEditingService] = useState(null)

const handleDeleteService = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
    setServices((prev) => prev.filter((s) => s.id !== id))
    }
}

const handleEditService = (service) => {
    setEditingService(service)
    setIsDialogOpen(true)
}

const handleNewService = () => {
    setEditingService(null)
    setIsDialogOpen(true)
}

const getStatusBadge = (status) => {
    switch (status) {
    case 'active':
        return (
        <Badge className="bg-green-500 text-white border-0">
            Activo
        </Badge>
        )
    case 'paused':
        return (
        <Badge className="bg-yellow-500 text-white border-0">
            Pausado
        </Badge>
        )
    case 'draft':
        return (
        <Badge className="bg-gray-500 text-white border-0">
            Borrador
        </Badge>
        )
    default:
        return null
    }
}

return (
    <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
        <div className="p-3 bg-linear-to-br from-[#2B6CB0] to-[#1E3A5F] rounded-xl">
            <Package className="text-white" size={28} />
        </div>
        <div>
            <h1 className="text-[#1E3A5F]">Mis Servicios</h1>
            <p className="text-[#A0AEC0] mt-1">
            Gestiona tus servicios publicados
            </p>
        </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
            <Button
            onClick={handleNewService}
            className="bg-linear-to-r from-[#2B6CB0] to-[#1E3A5F] text-white"
            >
            <Plus size={18} className="mr-2" />
            Nuevo Servicio
            </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle className="text-[#1E3A5F]">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
            </DialogHeader>

            {/* FORM */}
            <div className="space-y-4 mt-4">
            <Input
                placeholder="Título del servicio"
                defaultValue={editingService?.title}
            />

            <Textarea
                placeholder="Descripción"
                defaultValue={editingService?.description}
            />

            <Select defaultValue={editingService?.category}>
                <SelectTrigger>
                <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="Desarrollo Web">
                    Desarrollo Web
                </SelectItem>
                <SelectItem value="Diseño">Diseño</SelectItem>
                <SelectItem value="Consultoría">
                    Consultoría
                </SelectItem>
                </SelectContent>
            </Select>

            <div className="flex gap-3 pt-4">
                <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
                >
                Cancelar
                </Button>
                <Button className="flex-1">
                {editingService ? 'Actualizar' : 'Publicar'}
                </Button>
            </div>
            </div>
        </DialogContent>
        </Dialog>
    </div>

    {/* Services */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {services.map((service) => (
        <div
            key={service.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border"
        >
            <div className="relative h-48">
            <ImageWithFallback
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3">
                {getStatusBadge(service.status)}
            </div>
            </div>

            <div className="p-6">
            <h3 className="text-[#1E3A5F] mb-2">
                {service.title}
            </h3>
            <p className="text-[#A0AEC0] mb-4 line-clamp-2">
                {service.description}
            </p>

            <div className="flex gap-2 pt-4 border-t">
                <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleEditService(service)}
                >
                <Edit size={16} className="mr-2" />
                Editar
                </Button>
                <Button
                variant="outline"
                className="flex-1 text-red-600"
                onClick={() =>
                    handleDeleteService(service.id)
                }
                >
                <Trash2 size={16} className="mr-2" />
                Eliminar
                </Button>
            </div>
            </div>
        </div>
        ))}
    </div>
    </div>
)
}
