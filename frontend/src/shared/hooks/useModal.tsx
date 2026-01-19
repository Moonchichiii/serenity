import { createContext, useCallback, useContext, useState } from 'react'

// Legal page keys used by the legal modal
export type LegalPageKey =
  | 'legal'
  | 'privacy'
  | 'cookies'
  | 'terms'
  | 'accessibility'

// Supported modal identifiers
export type ModalId = 'contact' | 'corporate' | 'cmsLogin' | 'gift' | 'legal'

// Per-modal payload typing (use `undefined` when no payload is needed)
type ModalPayloadMap = {
  contact: { defaultSubject?: string }
  corporate: {
    defaultEventType?: 'corporate' | 'team' | 'expo' | 'private' | 'other'
  }
  cmsLogin: undefined
  gift: undefined
  legal: { page: LegalPageKey }
}

type StateMap = Partial<Record<ModalId, boolean>>
type PayloadsMap = Partial<{ [K in ModalId]: ModalPayloadMap[K] }>

type Ctx = {
  open: <K extends ModalId>(id: K, payload?: ModalPayloadMap[K]) => void
  close: (id: ModalId) => void
  isOpen: (id: ModalId) => boolean
  getPayload: <K extends ModalId>(id: K) => ModalPayloadMap[K] | undefined
}

const ModalCtx = createContext<Ctx | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StateMap>({})
  const [payloads, setPayloads] = useState<PayloadsMap>({})

  // Open a modal and optionally store its payload
  const open = useCallback(
    <K extends ModalId>(id: K, payload?: ModalPayloadMap[K]) => {
      setState(s => ({ ...s, [id]: true }))
      if (payload) {
        setPayloads(p => ({ ...p, [id]: payload }))
      }
    },
    []
  )

  // Close a modal and clear its payload
  const close = useCallback((id: ModalId) => {
    setState(s => ({ ...s, [id]: false }))
    setPayloads(p => ({ ...p, [id]: undefined }))
  }, [])

  // Check if a modal is currently open
  const isOpen = useCallback((id: ModalId) => !!state[id], [state])

  // Get the typed payload for a modal (if any)
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

// Hook to access modal controls from within the provider
// eslint-disable-next-line react-refresh/only-export-components
export function useModal() {
  const ctx = useContext(ModalCtx)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
