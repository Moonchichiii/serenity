import { useContext } from "react";
import { ModalContext } from "./ModalProvider";
import type { ModalId, ModalPayloads } from "./modalTypes";

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside <ModalProvider>");

  const open = <K extends ModalId>(id: K, payload?: ModalPayloads[K]) => {
    ctx.open(id, payload);
  };

  const close = () => ctx.close();

  const isOpen = (id?: ModalId) => (id ? ctx.state?.id === id : !!ctx.state);

  const getPayload = <K extends ModalId>(id: K): ModalPayloads[K] | undefined => {
    if (ctx.state?.id !== id) return undefined;
    return ctx.state.payload as ModalPayloads[K] | undefined;
  };

  return { open, close, isOpen, getPayload, state: ctx.state };
}
