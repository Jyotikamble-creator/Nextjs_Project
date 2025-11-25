"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "h-4 w-4 rounded border border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-600 focus:ring-offset-0 focus:outline-none",
          "checked:bg-purple-600 checked:border-purple-600",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }