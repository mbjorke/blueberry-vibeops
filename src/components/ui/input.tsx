import * as React from "react"

import { cn } from "../../lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: 'default' | 'search' | 'hero';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const baseStyles = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-family: ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"";

    const variants = {
      default: baseStyles,
      search: "w-full h-14 pl-6 pr-4 text-lg bg-white/90 backdrop-blur border-0 rounded-2xl shadow-xl focus:bg-white transition-all text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600",
      hero: "w-full h-14 pl-6 pr-4 text-lg bg-white/90 backdrop-blur border-0 rounded-2xl shadow-xl focus:bg-white transition-all text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600",
    };

    return (
      <input
        type={type}
        className={cn(variants[variant], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
