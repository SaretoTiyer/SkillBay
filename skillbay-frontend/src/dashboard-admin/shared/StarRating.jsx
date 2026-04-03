import { Star } from "lucide-react";

export default function StarRating({ rating, size = 16, showValue = true }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} className="fill-amber-400 text-amber-400" />
      ))}
      {hasHalfStar && (
        <Star size={size} className="fill-amber-400 text-amber-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300" />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
