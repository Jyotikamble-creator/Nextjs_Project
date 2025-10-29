import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightElement, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-3.5 bg-[#1a2332] border rounded-lg text-white placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
              "transition-all duration-200",
              error
                ? "border-red-500/50 focus:ring-red-500"
                : "border-gray-700/50 hover:border-gray-600/50",
              rightElement && "pr-12",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";