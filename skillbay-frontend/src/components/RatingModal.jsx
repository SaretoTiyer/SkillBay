import { useState, useEffect, useCallback } from "react";
import { Star, X } from "lucide-react";
import { Button } from "./ui/Button";

export default function RatingModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title = "Califica tu experiencia",
  subtitle = "¿Cómo fue tu experiencia con este servicio?",
  loading = false 
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setComment("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    if (rating === 0) {
      setError("Por favor selecciona una calificación");
      return;
    }
    
    setError("");
    onSubmit({ rating, comment });
  }, [rating, comment, onSubmit]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const getRatingLabel = (value) => {
    const labels = {
      1: "Muy insatisfecho",
      2: "Insatisfecho",
      3: "Neutral",
      4: "Satisfecho",
      5: "Muy satisfecho"
    };
    return labels[value] || "";
  };

  const currentDisplayRating = hoverRating || rating;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rating-title"
    >
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        role="document"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 
            id="rating-title" 
            className="text-xl font-bold text-gray-900"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Cerrar"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">{subtitle}</p>

          <div className="mb-6">
            <label 
              id="rating-label" 
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              Tu calificación
            </label>
            <div 
              className="flex items-center justify-center gap-2"
              role="radiogroup"
              aria-labelledby="rating-label"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onFocus={() => setHoverRating(value)}
                  onBlur={() => setHoverRating(0)}
                  disabled={loading}
                  className={`
                    p-1 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    ${rating === value ? 'scale-110' : 'hover:scale-105'}
                  `}
                  aria-label={`${value} de 5 estrellas${value === currentDisplayRating && currentDisplayRating > 0 ? ` - ${getRatingLabel(currentDisplayRating)}` : ''}`}
                  aria-pressed={rating === value}
                  role="radio"
                  aria-checked={rating === value}
                >
                  <Star
                    size={36}
                    className={`
                      transition-colors duration-200
                      ${value <= currentDisplayRating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                      }
                    `}
                  />
                </button>
              ))}
            </div>
            {currentDisplayRating > 0 && (
              <p 
                className="text-center text-sm font-medium text-gray-600 mt-2"
                aria-live="polite"
              >
                {getRatingLabel(currentDisplayRating)}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label 
              htmlFor="rating-comment" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comentario <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="rating-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
              placeholder="Escribe tu experiencia con el servicio..."
              rows={4}
              maxLength={1000}
              className="
                w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                transition-all duration-200 resize-none
                placeholder:text-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-describedby="comment-hint"
            />
            <p 
              id="comment-hint" 
              className="text-xs text-gray-400 mt-1 text-right"
            >
              {comment.length}/1000
            </p>
          </div>

          {error && (
            <p 
              className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando…
                </span>
              ) : (
                "Enviar calificación"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
