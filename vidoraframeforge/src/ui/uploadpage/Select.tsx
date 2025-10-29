import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-4 py-3 bg-[#1e2837] border rounded-lg text-white",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
            "transition-all duration-200 cursor-pointer",
            error
              ? "border-red-500/50"
              : "border-gray-700/50 hover:border-gray-600/50",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";