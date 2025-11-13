import { createContext, useCallback, useContext, useState } from 'react'

type ModalId = 'contact' | 'corporate' | 'cmsLogin'

type ModalPayload = {
  defaultSubject?: string
  defaultEventType?: 'corporate' | 'team' | 'expo' | 'private' | 'other'
}

type StateMap = Partial<Record<ModalId, boolean>>
type PayloadMap = Partial<Record<ModalId, ModalPayload | undefined>>

type Ctx = {
  open: (id: ModalId, payload?: ModalPayload) => void
  close: (id: ModalId) => void
  isOpen: (id: ModalId) => boolean
  getPayload: (id: ModalId) => ModalPayload | undefined
}

const ModalCtx = createContext<Ctx | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StateMap>({})
  const [payloads, setPayloads] = useState<PayloadMap>({})

  const open = useCallback((id: ModalId, payload?: ModalPayload) => {
    setState(s => ({ ...s, [id]: true }))
    if (payload) setPayloads(p => ({ ...p, [id]: payload }))
  }, [])

  const close = useCallback((id: ModalId) => {
    setState(s => ({ ...s, [id]: false }))
    setPayloads(p => ({ ...p, [id]: undefined }))
  }, [])

  const isOpen = useCallback((id: ModalId) => !!state[id], [state])

  const getPayload = useCallback((id: ModalId) => payloads[id], [payloads])

  return (
    <ModalCtx.Provider value={{ open, close, isOpen, getPayload }}>
      {children}
    </ModalCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useModal() {
  const ctx = useContext(ModalCtx)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
