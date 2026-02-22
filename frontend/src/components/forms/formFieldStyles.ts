import { cn } from "@/lib/utils";

/** Consistent input styling */
export const inputClass = cn(
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5",
  "text-sm text-foreground placeholder:text-stone-400",
  "transition-colors",
  "focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);
