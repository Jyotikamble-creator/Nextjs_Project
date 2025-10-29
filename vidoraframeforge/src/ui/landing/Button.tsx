import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant = "primary", size = "md", icon, className, ...props },
    ref
  ) => {
    const baseStyles =
      "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2";

    const variants = {
      primary:
        "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white",
      secondary: "bg-white/10 hover:bg-white/20 text-white",
      ghost: "bg-transparent hover:bg-white/10 text-white",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {icon && <span>{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";