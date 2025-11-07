import React from "react";
import { cn } from "./utils";

export function Button({
className = "",
variant = "default",
size = "default",
asChild = false,
...props
}) {
const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-blue-300";

const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100 text-gray-700",
    link: "text-blue-600 underline-offset-4 hover:underline",
};

const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-sm",
    lg: "h-10 rounded-md px-6 text-base",
    icon: "size-9 rounded-md p-2",
};

return (
    <button
    className={cn(base, variants[variant], sizes[size], className)}
    {...props}
    />
);
}
