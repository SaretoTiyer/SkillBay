import { API_URL } from "../config/api";

export function resolveImageUrl(imagePath) {
  if (!imagePath) return null;
  const path = String(imagePath);
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const backendBase = API_URL.replace(/\/api$/, "");
  // Strip all leading slashes to normalize
  const cleaned = path.replace(/^\/+/, "");
  // If it already contains 'storage/' at the start, don't add another
  if (cleaned.startsWith("storage/")) {
    return `${backendBase}/${cleaned}`;
  }
  return `${backendBase}/storage/${cleaned}`;
}
