import type { InputHTMLAttributes } from "react";

/**
 * Invisible spam trap, mirrored by the backend's HoneypotMixin.
 *
 * Humans never see or reach it (visually hidden off-screen, out of the
 * tab order, hidden from assistive tech); bots auto-fill it and the
 * backend rejects with code "spam_detected". NOT display:none — some
 * bots skip fields they detect as hidden that way.
 */
export function HoneypotField(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
    >
      <label htmlFor="website-hp">Website</label>
      <input
        id="website-hp"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...props}
      />
    </div>
  );
}
