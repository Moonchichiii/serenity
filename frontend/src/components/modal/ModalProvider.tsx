import type { PropsWithChildren } from "react"
import { useCallback, useMemo, useState } from "react"
import { ModalShell } from "./ModalShell"
import type { ModalId, ModalPayloadMap, ModalState } from "./modalTypes"
import { modalRegistry, modalMeta } from "./modalRegistry"
import { ModalContext } from "./ModalContext"

export function ModalProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<ModalState>({ id: null, payload: null })

  const open = useCallback(
    <K extends ModalId>(id: K, payload?: ModalPayloadMap[K]) => {
      setState({
        id,
        payload: (payload ?? null) as ModalPayloadMap[ModalId] | null,
      })
    },
    [],
  )

  const close = useCallback(() => {
    setState({ id: null, payload: null })
  }, [])

  const isOpen = useCallback((id: ModalId) => state.id === id, [state.id])

  const getPayload = useCallback(
    <K extends ModalId>(id: K) =>
      state.id === id ? (state.payload as ModalPayloadMap[K] | null) : null,
    [state.id, state.payload],
  )

  const value = useMemo(
    () => ({ open, close, isOpen, getPayload }),
    [open, close, isOpen, getPayload],
  )

  const ActiveScreen = state.id ? modalRegistry[state.id] : null
  const meta = state.id ? modalMeta[state.id] : undefined

  return (
    <ModalContext.Provider value={value}>
      {children}

      <ModalShell
        isOpen={Boolean(state.id)}
        onClose={close}
        className={meta?.className}
        scrollable={meta?.scrollable}
      >
        {ActiveScreen ? <ActiveScreen /> : null}
      </ModalShell>
    </ModalContext.Provider>
  )
}
