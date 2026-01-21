import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  [
    // Layout
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    // Typography
    "text-sm font-medium",
    // Visual
    "rounded-md cursor-pointer",
    // States
    "hover:scale-105 transition-all duration-200",
    // Focus - Enhanced for better visibility
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-opacity-75 focus-visible:shadow-outline",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-50",
    // Icons
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-accent/50 text-accent-foreground shadow-sm hover:shadow-md transition-shadow",
          "hover:bg-accent/90",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
          "focus-visible:ring-destructive"
        ].join(" "),
        outline: [
          "border border-input",
          "hover:bg-accent/10",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
        ].join(" "),
        ghost: [
          "bg-accent/10 hover:bg-accent/20",
        ].join(" "),
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),
        premium: [
          "bg-gradient-primary text-white",
          "hover:shadow-premium",
        ].join(" "),
        success: [
          "bg-success text-success-foreground",
          "hover:bg-success/90",
          "focus-visible:ring-2 focus-visible:ring-success",
          "shadow-card"
        ].join(" "),
        fintech: [
          "bg-gradient-secondary text-white",
          "hover:bg-secondary/90",
          "focus-visible:ring-2 focus-visible:ring-secondary",
          "shadow-elegant"
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        circle: "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
