import { cn } from "@/lib/utils";
import type { FieldError } from "react-hook-form";

interface FormFieldProps {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
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
