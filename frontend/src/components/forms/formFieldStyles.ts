import { cn } from "@/lib/utils";

export const formLabel = cn(
  "block text-sm font-medium text-charcoal/80 mb-2",
);

export const formInput = cn(
  "w-full rounded-2xl border border-warm-grey-200 bg-white/80",
  "px-4 py-3 text-[15px] text-charcoal",
  "placeholder:text-warm-grey-400",
  "transition-all duration-200 ease-out",
  "focus:outline-none focus:border-sage-400",
  "focus:ring-[3px] focus:ring-sage-200/50",
  "focus:bg-white",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

export const formInputWithIcon = cn(formInput, "pl-11");

export const formTextarea = cn(
  formInput,
  "resize-none min-h-[100px]",
);

export const formSelect = cn(
  formInput,
  "appearance-none",
  "bg-[length:20px] bg-[right_12px_center] bg-no-repeat",
  "pr-10", // room for chevron
  "form-select", // hooks the globals.css select chevron rule
);

export const formError = cn(
  "text-xs text-terracotta-500 mt-1.5",
  "flex items-center gap-1",
);

export const formFieldGroup = cn(
  "group relative",
);

export const formIconWrapper = cn(
  "form-field-icon absolute left-3.5 top-1/2 -translate-y-1/2",
  "h-[18px] w-[18px] text-warm-grey-400",
  "pointer-events-none transition-colors",
);

export const formSection = cn(
  "rounded-2xl border border-warm-grey-200/60",
  "bg-sand-50/30 p-5 space-y-4",
);

export const formSectionTitle = cn(
  "text-xs font-bold uppercase tracking-[0.15em]",
  "text-charcoal/50 flex items-center gap-2",
);

export const formPrimaryButton = cn(
  "w-full h-12 rounded-2xl font-medium text-white",
  "bg-gradient-sage shadow-glow-sage",
  "hover:shadow-elevated transition-all",
  "active:scale-[0.99]",
  "focus:outline-none focus:ring-[3px] focus:ring-sage-200/60",
);
