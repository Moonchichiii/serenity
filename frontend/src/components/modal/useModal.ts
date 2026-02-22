import { useContext } from 'react'
import { ModalContext } from './ModalProvider'
import type { ModalId, ModalPayloadMap } from "./modalTypes";

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used inside <ModalProvider>')

  const open = <K extends ModalId>(id: K, payload?: ModalPayloadMap[K]) => {
    ctx.open(id, payload)
  }

  // Close is global (closes whatever is open)
  const close = () => ctx.close()

  // isOpen requires an id (clean + explicit)
  const isOpen = (id: ModalId) => ctx.isOpen(id)

  const getPayload = <K extends ModalId>(id: K): ModalPayloadMap[K] | null => {
    return ctx.getPayload(id)
  }

  return { open, close, isOpen, getPayload }
}
