import { motion } from "framer-motion";
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
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <motion.div
        className={cn(
          "rounded-full border-2 border-muted",
          "border-t-foreground",
          sizeClasses[size],
          className
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
