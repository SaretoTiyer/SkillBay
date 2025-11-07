import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina clases condicionales y limpia duplicados de Tailwind
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
