import { useState, useCallback } from "react";
import { ModalContext } from "./ModalContext";
import { SheetShell } from "./SheetShell";
import { modalRegistry, modalMeta } from "./modalRegistry";
import type { ModalId, ModalPayloadMap, ModalState } from "./modalTypes";

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    id: null,
    payload: null,
  });

  const open = useCallback(
    <K extends ModalId>(id: K, payload?: ModalPayloadMap[K]) => {
      setModalState({ id, payload: payload ?? null });
    },
    [],
  );

  const close = useCallback(() => {
    setModalState({ id: null, payload: null });
  }, []);

  const isOpen = useCallback(
    (id: ModalId) => modalState.id === id,
    [modalState.id],
  );

  const getPayload = useCallback(
    <K extends ModalId>(id: K): ModalPayloadMap[K] | null => {
      if (modalState.id === id) {
        return modalState.payload as ModalPayloadMap[K] | null;
      }
      return null;
    },
    [modalState],
  );

  const ActiveComponent = modalState.id ? modalRegistry[modalState.id] : null;
  const meta = modalState.id ? modalMeta[modalState.id] : null;

  return (
    <ModalContext.Provider value={{ open, close, isOpen, getPayload }}>
      {children}
      {ActiveComponent && modalState.id && (
        <SheetShell
          isOpen={!!modalState.id}
          onClose={close}
          modalId={modalState.id}
          className={meta?.className}
        >
          <ActiveComponent />
        </SheetShell>
      )}
    </ModalContext.Provider>
  );
}
