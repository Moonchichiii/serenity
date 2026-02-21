import type { PropsWithChildren } from 'react'
import { useCallback, useRef } from 'react'
import { useModal } from '@/hooks/useModal'

type SecretTriggerProps = PropsWithChildren<{
  modalId: 'cmsLogin' | 'contact'
  times?: number
  windowMs?: number
  className?: string
}>

export default function SecretTrigger({
  modalId,
  times = 3,
  windowMs = 800,
  className = '',
  children,
}: SecretTriggerProps) {
  const { open } = useModal()
  const clicksRef = useRef<number>(0)
  const timerRef = useRef<number | null>(null)

  const reset = () => {
    clicksRef.current = 0
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleClick = useCallback((e: React.MouseEvent) => {
    clicksRef.current += 1
    if (!timerRef.current) {
      timerRef.current = window.setTimeout(reset, windowMs)
    }
    if (clicksRef.current >= times) {
      e.preventDefault()
      reset()
      open(modalId)
    }
  }, [modalId, times, windowMs, open])

  return (
    <span onClick={handleClick} className={className} aria-hidden="true">
      {children}
    </span>
  )
}
