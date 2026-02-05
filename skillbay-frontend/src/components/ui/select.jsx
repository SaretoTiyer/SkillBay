import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import {
CheckIcon,
ChevronDownIcon,
ChevronUpIcon,
} from "lucide-react"

import { cn } from "./utils"

function Select(props) {
return (
    <SelectPrimitive.Root data-slot="select" {...props} />
)
}

function SelectGroup(props) {
return (
    <SelectPrimitive.Group
    data-slot="select-group"
    {...props}
    />
)
}

function SelectValue(props) {
return (
    <SelectPrimitive.Value
    data-slot="select-value"
    {...props}
    />
)
}

function SelectTrigger({
className,
size = "default",
children,
...props
}) {
return (
    <SelectPrimitive.Trigger
    data-slot="select-trigger"
    data-size={size}
    className={cn(
        "border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8",
        className
    )}
    {...props}
    >
    {children}
    <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
    </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
)
}

function SelectContent({
className,
children,
position = "popper",
...props
}) {
return (
    <SelectPrimitive.Portal>
    <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
        "bg-popover text-popover-foreground relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border shadow-md",
        position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
        className
        )}
        {...props}
    >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="p-1">
        {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
    </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
)
}

function SelectLabel({ className, ...props }) {
return (
    <SelectPrimitive.Label
    data-slot="select-label"
    className={cn(
        "px-2 py-1.5 text-xs text-muted-foreground",
        className
    )}
    {...props}
    />
)
}

function SelectItem({ className, children, ...props }) {
return (
    <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(
        "relative flex w-full cursor-default items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
    )}
    {...props}
    >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>
        {children}
    </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
)
}

function SelectSeparator({ className, ...props }) {
return (
    <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn("my-1 h-px bg-border", className)}
    {...props}
    />
)
}

function SelectScrollUpButton({ className, ...props }) {
return (
    <SelectPrimitive.ScrollUpButton
    data-slot="select-scroll-up-button"
    className={cn(
        "flex items-center justify-center py-1",
        className
    )}
    {...props}
    >
    <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
)
}

function SelectScrollDownButton({ className, ...props }) {
return (
    <SelectPrimitive.ScrollDownButton
    data-slot="select-scroll-down-button"
    className={cn(
        "flex items-center justify-center py-1",
        className
    )}
    {...props}
    >
    <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
)
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
}
