import { resolveImageUrl } from "./image";

const CATEGORY_TO_PLACEHOLDER = {
  "Desarrollo Web": "desarrollo_web",
  "Diseno Grafico": "diseno_grafico",
  "Diseño Grafico": "diseno_grafico",
  "Marketing Digital": "marketing_digital",
  "Consultoria": "consultoria",
  "Desarrollo Movil": "desarrollo_movil",
  "Limpieza": "limpieza",
  "Jardineria": "jardineria",
  "Plomeria": "plomeria",
  "Electricidad": "electricidad",
  "Tutorias": "tutorias",
  "Idiomas": "idiomas",
  "Musica": "musica",
};

function getPlaceholderPath(categoryName, type = "service") {
  const key = CATEGORY_TO_PLACEHOLDER[categoryName];
  const filename = key
    ? `${key}.png`
    : type === "opportunity"
    ? "oportunidad_default.png"
    : "servicio_default.png";
  return resolveImageUrl(`placeholders/${filename}`);
}

export function getServiceImage(service) {
  if (service.imagen) return resolveImageUrl(service.imagen);
  const catImage = service.categoria?.imagen;
  if (catImage) return resolveImageUrl(catImage);
  const catName = service.categoria?.nombre || "";
  return getPlaceholderPath(catName, "service");
}

export function getOpportunityImage(service) {
  if (service.imagen) return resolveImageUrl(service.imagen);
  const catImage = service.categoria?.imagen;
  if (catImage) return resolveImageUrl(catImage);
  const catName = service.categoria?.nombre || "";
  return getPlaceholderPath(catName, "opportunity");
}

export function getCategoryFallbackImage(categoryName, type = "service") {
  return getPlaceholderPath(categoryName || "", type);
}
