import { TrendingUp, Users } from "lucide-react";
import ReviewCard from "../../components/ReviewCard";

export default function ProfileReviews({ reviews }) {
    const ofertanteReviews = reviews?.ofertante || [];
    const clienteReviews = reviews?.cliente || [];

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Reseñas</h3>
                <p className="text-sm text-gray-500 mt-1">Opiniones de otros usuarios sobre tu trabajo</p>
            </div>

            {/* Como ofertante */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <TrendingUp size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Como proveedor de servicios</h4>
                        <p className="text-sm text-gray-500">{ofertanteReviews.length} evaluacion{ofertanteReviews.length !== 1 ? 'es' : ''}</p>
                    </div>
                </div>
                {ofertanteReviews.length > 0 ? (
                    <div className="space-y-3">
                        {ofertanteReviews.map((review, idx) => (
                            <ReviewCard key={review.id_Reseña || idx} review={review} sectionRole="ofertante" />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                        <p className="text-gray-400 text-sm">Sin evaluaciones como proveedor aún</p>
                    </div>
                )}
            </div>

            {/* Como cliente */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Users size={18} className="text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Como cliente</h4>
                        <p className="text-sm text-gray-500">{clienteReviews.length} evaluacion{clienteReviews.length !== 1 ? 'es' : ''}</p>
                    </div>
                </div>
                {clienteReviews.length > 0 ? (
                    <div className="space-y-3">
                        {clienteReviews.map((review, idx) => (
                            <ReviewCard key={review.id_Reseña || idx} review={review} sectionRole="cliente" />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                        <p className="text-gray-400 text-sm">Sin evaluaciones como cliente aún</p>
                    </div>
                )}
            </div>
        </div>
    );
}
