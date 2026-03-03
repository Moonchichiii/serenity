import type { PropsWithChildren } from "react";
import { useCallback, useMemo, useState } from "react";
import { ModalShell } from "./ModalShell";
import { SheetShell } from "./SheetShell"; // 1. Import new shell
import type { ModalId, ModalPayloadMap, ModalState } from "./modalTypes";
import { modalRegistry } from "./modalRegistry";
import { ModalContext } from "./ModalContext";

export const modalMeta: Record<
  ModalId,
  { title: string; className?: string; scrollable?: boolean }
> = {
  contact: {
    title: "Contact",
    className: "max-w-lg",
    scrollable: true,
  },
  corporate: {
    title: "Corporate Inquiry",
    className: "max-w-3xl md:max-w-4xl",
    scrollable: true,
  },
  // 2. Updated Title for Gift to be shorter/punchier
  gift: {
    title: "Gift Voucher",
    className: "", // Classname handled by Sheet default
    scrollable: true,
  },
  legal: {
    title: "Legal",
    className: "max-w-4xl",
    scrollable: true,
  },
  cmsLogin: {
    title: "CMS Login",
    className: "max-w-lg",
    scrollable: true,
  },
};

export function ModalProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<ModalState>({ id: null, payload: null });

  const open = useCallback(
    <K extends ModalId>(id: K, payload?: ModalPayloadMap[K]) => {
      setState({
        id,
        payload: (payload ?? null) as ModalPayloadMap[ModalId] | null,
      });
    },
    []
  );

  const close = useCallback(() => {
    setState({ id: null, payload: null });
  }, []);

  const isOpen = useCallback((id: ModalId) => state.id === id, [state.id]);

  const getPayload = useCallback(
    <K extends ModalId>(id: K) =>
      state.id === id ? (state.payload as ModalPayloadMap[K] | null) : null,
    [state.id, state.payload]
  );

  const value = useMemo(
    () => ({ open, close, isOpen, getPayload }),
    [open, close, isOpen, getPayload]
  );

  const ActiveScreen = state.id ? modalRegistry[state.id] : null;
  const meta = state.id ? modalMeta[state.id] : undefined;

  // 3. Logic Switch: Use Sheet for 'gift', Modal for everything else
  const isSheet = state.id === "gift";

  return (
    <ModalContext.Provider value={value}>
      {children}

      {isSheet ? (
        <SheetShell
          isOpen={Boolean(state.id)}
          onClose={close}
          title={meta?.title}
        >
          {ActiveScreen ? <ActiveScreen /> : null}
        </SheetShell>
      ) : (
        <ModalShell
          isOpen={Boolean(state.id)}
          onClose={close}
          title={meta?.title}
          className={meta?.className}
          scrollable={meta?.scrollable}
        >
          {ActiveScreen ? <ActiveScreen /> : null}
        </ModalShell>
      )}
    </ModalContext.Provider>
  );
}
