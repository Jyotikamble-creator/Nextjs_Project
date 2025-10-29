import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 bg-[#1e2837] border rounded-lg text-white placeholder-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
            "transition-all duration-200",
            error
              ? "border-red-500/50"
              : "border-gray-700/50 hover:border-gray-600/50",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-gray-400">{helperText}</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";