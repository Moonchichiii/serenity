import { cn } from "@/lib/utils";
import type { FieldError } from "react-hook-form";

interface FormFieldProps {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-foreground/80">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

/** Consistent input styling */
export const inputClass = cn(
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5",
  "text-sm text-foreground placeholder:text-stone-400",
  "transition-colors",
  "focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);
