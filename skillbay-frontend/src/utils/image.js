import { API_URL } from "../config/api";

export function resolveImageUrl(imagePath) {
  if (!imagePath) return null;
  if (String(imagePath).startsWith("http://") || String(imagePath).startsWith("https://")) {
    return imagePath;
  }
  const backendBase = API_URL.replace(/\/api$/, "");
  const cleaned = String(imagePath).replace(/^\/+/, "");
  return `${backendBase}/storage/${cleaned}`;
}
