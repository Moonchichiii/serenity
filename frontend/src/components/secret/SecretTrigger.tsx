import { useRef } from "react";
import type { ReactNode } from "react";
import { useModal } from "@/components/modal/useModal";
import type { ModalId } from "@/components/modal/modalTypes";

/**
 * SecretTrigger — invisible easter-egg entry point.
 *
 * Fires `open(modalId)` when the child is tapped `times` times within a
 * rolling `windowMs` window (e.g. triple-click "Serenity." in the About
 * section opens the CMS login). Intentionally pointer-only and outside
 * the tab order: a secret door should not announce itself to keyboard
 * or screen-reader navigation.
 */

type Props = {
  modalId: ModalId;
  times: number;
  windowMs: number;
  children: ReactNode;
  className?: string;
};

export default function SecretTrigger({
  modalId,
  times,
  windowMs,
  children,
  className,
}: Props) {
  const { open } = useModal();
  const tapsRef = useRef<number[]>([]);

  const handleTap = () => {
    const now = Date.now();
    const recent = tapsRef.current.filter((t) => now - t < windowMs);
    recent.push(now);
    tapsRef.current = recent;

    if (recent.length >= times) {
      tapsRef.current = [];
      open(modalId);
    }
  };

  return (
    <span className={className} onClick={handleTap}>
      {children}
    </span>
  );
}
