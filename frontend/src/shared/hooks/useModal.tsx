import { createContext, useCallback, useContext, useState } from 'react'

type ModalMap = { contact?: boolean }

type Ctx = {
  open: (id: keyof ModalMap) => void
  close: (id: keyof ModalMap) => void
  isOpen: (id: keyof ModalMap) => boolean
}

const ModalCtx = createContext<Ctx | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalMap>({})

  const open = useCallback((id: keyof ModalMap) => setState(s => ({ ...s, [id]: true })), [])
  const close = useCallback((id: keyof ModalMap) => setState(s => ({ ...s, [id]: false })), [])
  const isOpen = useCallback((id: keyof ModalMap) => !!state[id], [state])

  return <ModalCtx.Provider value={{ open, close, isOpen }}>{children}</ModalCtx.Provider>
}

export function useModal() {
  const ctx = useContext(ModalCtx)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
