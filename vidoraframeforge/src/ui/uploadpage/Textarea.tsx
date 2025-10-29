import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3 bg-[#1e2837] border rounded-lg text-white placeholder-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
            "transition-all duration-200 resize-none",
            error
              ? "border-red-500/50"
              : "border-gray-700/50 hover:border-gray-600/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";