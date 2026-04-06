import { resolveImageUrl } from "./image";
import { getCategoryPlaceholder, getDefaultPlaceholder } from "./categoryPlaceholders";

export function getServiceImage(service, width = 400, height = 300) {
  if (service.imagen) return resolveImageUrl(service.imagen);
  const catImage = service.categoria?.imagen;
  if (catImage) return resolveImageUrl(catImage);
  return getCategoryPlaceholder(service, width, height);
}

export function getOpportunityImage(service, width = 400, height = 300) {
  if (service.imagen) return resolveImageUrl(service.imagen);
  const catImage = service.categoria?.imagen;
  if (catImage) return resolveImageUrl(catImage);
  return getCategoryPlaceholder(service, width, height);
}

export function getCategoryFallbackImage(categoryName, type = "service") {
  const mockService = { categoria: { nombre: categoryName } };
  return getCategoryPlaceholder(mockService);
}

export { getCategoryPlaceholder, getDefaultPlaceholder };
