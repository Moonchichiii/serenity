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
      <label
        className="block font-medium text-foreground/80"
        style={{
          fontSize: "var(--typo-small)",
          lineHeight: "var(--leading-small)",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          className="text-red-500 mt-1"
          role="alert"
          style={{
            fontSize: "var(--typo-caption)",
            lineHeight: "var(--leading-caption)",
          }}
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
