import React from "react";
import { cn } from "./utils";

export function Input({ className = "", type = "text", ...props }) {
return (
    <input
    type={type}
    data-slot="input"
    className={cn(
        "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition disabled:cursor-not-allowed disabled:opacity-50",
        className
    )}
    {...props}
    />
);
}
