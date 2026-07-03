import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-muted",
          "border-t-foreground motion-reduce:animate-none",
          sizeClasses[size],
          className,
        )}
      />
    </div>
  );
}
