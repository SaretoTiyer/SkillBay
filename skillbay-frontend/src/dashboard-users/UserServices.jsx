import { useState, useEffect } from "react";
import { Package, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import CreateOpportunity from "./Myservices/CreateOpportunity";
import CreateService from "./Myservices/CreateService";
import MyServices from "./Myservices/MyServices";
import ReceivedRequests from "./Myservices/ReceivedRequests";


export default function UserServices() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("create-service");

    useEffect(() => {
        // Simular carga inicial
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-200">
                        <Package className="text-white h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mis Servicios</h1>
                        <p className="text-slate-500 font-medium">Gestiona y promociona tus ofertas profesionales</p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl h-12">
                    <TabsTrigger 
                        value="create-service" 
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 text-sm font-medium"
                    >
                        ➕ Crear Servicio
                    </TabsTrigger>
                    <TabsTrigger 
                        value="create-opportunity" 
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 text-sm font-medium"
                    >
                        🔍 Crear Búsqueda
                    </TabsTrigger>
                    <TabsTrigger 
                        value="my-services" 
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 text-sm font-medium"
                    >
                        💼 Mis Servicios
                    </TabsTrigger>
                    <TabsTrigger 
                        value="received-requests" 
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 text-sm font-medium"
                    >
                        📥 Solicitudes
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Crear Servicio */}
                <TabsContent value="create-service" className="mt-6">
                    <CreateService />
                </TabsContent>

                {/* Tab: Crear Búsqueda */}
                <TabsContent value="create-opportunity" className="mt-6">
                    <CreateOpportunity />
                </TabsContent>

                {/* Tab: Mis Servicios */}
                <TabsContent value="my-services" className="mt-6">
                    <MyServices />
                </TabsContent>

                {/* Tab: Solicitudes */}
                <TabsContent value="received-requests" className="mt-6">
                    <ReceivedRequests />
                </TabsContent>
            </Tabs>
        </div>
    );
}
