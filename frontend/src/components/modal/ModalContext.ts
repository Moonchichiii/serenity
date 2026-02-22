import { createContext } from "react";
import type { ModalId, ModalPayloadMap } from "./modalTypes";

export type ModalContextValue = {
  open: <K extends ModalId>(id: K, payload?: ModalPayloadMap[K]) => void;
  close: () => void;
  isOpen: (id: ModalId) => boolean;
  getPayload: <K extends ModalId>(id: K) => ModalPayloadMap[K] | null;
};

export const ModalContext = createContext<ModalContextValue | null>(null);
