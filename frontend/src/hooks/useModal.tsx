import { createContext, useCallback, useContext, useState } from 'react'

// Legal page identifiers
export type LegalPageKey =
  | 'legal'
  | 'privacy'
  | 'cookies'
  | 'terms'
  | 'accessibility'

// Modal identifiers
export type ModalId = 'contact' | 'corporate' | 'cmsLogin' | 'gift' | 'legal'

// Modal payload types
type ModalPayloadMap = {
  contact: { defaultSubject?: string }
  corporate: {
    defaultEventType?: 'corporate' | 'team' | 'expo' | 'private' | 'other'
  }
  cmsLogin: undefined
  gift: undefined
  legal: { page: LegalPageKey }
}

// Internal state types
type StateMap = Partial<Record<ModalId, boolean>>
type PayloadsMap = Partial<{ [K in ModalId]: ModalPayloadMap[K] }>

// Context API
type Ctx = {
  open: <K extends ModalId>(id: K, payload?: ModalPayloadMap[K]) => void
  close: (id: ModalId) => void
  isOpen: (id: ModalId) => boolean
  getPayload: <K extends ModalId>(id: K) => ModalPayloadMap[K] | undefined
}

const ModalCtx = createContext<Ctx | null>(null)

// Provider component
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StateMap>({})
  const [payloads, setPayloads] = useState<PayloadsMap>({})

  const open = useCallback(
    <K extends ModalId>(id: K, payload?: ModalPayloadMap[K]) => {
      setState(s => ({ ...s, [id]: true }))
      if (payload) {
        setPayloads(p => ({ ...p, [id]: payload }))
      }
    },
    []
  )

  const close = useCallback((id: ModalId) => {
    setState(s => ({ ...s, [id]: false }))
    setPayloads(p => ({ ...p, [id]: undefined }))
  }, [])

  const isOpen = useCallback((id: ModalId) => !!state[id], [state])

  const getPayload = useCallback(
    <K extends ModalId>(id: K) => {
      return payloads[id] as ModalPayloadMap[K] | undefined
    },
    [payloads]
  )

  return (
    <ModalCtx.Provider value={{ open, close, isOpen, getPayload }}>
      {children}
    </ModalCtx.Provider>
  )
}

// Hook for modal controls
// eslint-disable-next-line react-refresh/only-export-components
export function useModal() {
  const ctx = useContext(ModalCtx)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
