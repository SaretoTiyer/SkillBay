import React from "react";
import { cn } from "./utils";

export function Label({ className = "", children, ...props }) {
return (
    <label
    data-slot="label"
    className={cn(
        "flex items-center gap-2 text-sm font-medium text-gray-700 select-none",
        className
    )}
    {...props}
    >
    {children}
    </label>
);
}
