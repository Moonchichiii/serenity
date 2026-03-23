import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useModal } from '@/components/modal/useModal'
import {
  getConsent,
  saveConsent,
  defaultConsent,
  CONSENT_VERSION,
  onCookieSettingsOpen,
} from '@/components/ui/consent'

function afterIdle(cb: () => void, timeout = 2500): number {
  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(cb, { timeout })
  }
  return setTimeout(cb, timeout) as unknown as number
}

function cancelIdle(id: number) {
  if (typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

export default function CookieConsent({
  className = '',
}: {
  className?: string
}) {
  const { t } = useTranslation()
  const { open: openModal } = useModal()

  const initial = useMemo(() => getConsent(), [])
  const needsBanner = !initial

  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!needsBanner) return

    const id = afterIdle(() => setReady(true), 2500)
    return () => cancelIdle(id)
  }, [needsBanner])

  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [media, setMedia] = useState(initial?.media ?? false)
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false)

  useEffect(() => {
    if (ready && needsBanner) setIsOpen(true)
  }, [ready, needsBanner])

  useEffect(() => {
    return onCookieSettingsOpen(() => {
      const latest = getConsent()
      setMedia(latest?.media ?? false)
      setAnalytics(latest?.analytics ?? false)
      setExpanded(true)
      setIsOpen(true)
    })
  }, [])

  if (!isOpen) return null

  const ui = (
    <div
      className={[
        'pointer-events-none fixed inset-x-0 bottom-4 z-[9998] flex justify-center px-4',
        className,
      ].join(' ')}
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-2xl rounded-3xl border-2 border-sage-200 bg-white/95 shadow-elevated backdrop-blur-md">
        <div className="p-4 sm:p-5">
          <p className="text-sm text-charcoal/90 sm:text-base">
            {t('cookie.intro')}{' '}
            <span className="font-medium">{t('cookie.mediaTitle')}</span>{' '}
            {t('and', { defaultValue: 'and' })}{' '}
            <span className="font-medium">{t('cookie.analyticsTitle')}</span>.
            <button
              type="button"
              onClick={() => openModal('legal', { page: 'privacy' })}
              className="warm-underline ml-1 rounded-sm font-medium text-charcoal hover:text-charcoal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400"
            >
              {t('cookie.learnMore')}
            </button>
            .
          </p>

          <div className="mt-3">
            <button
              type="button"
              className="rounded-sm text-sm text-charcoal/80 underline underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? t('cookie.hideOptions') : t('cookie.customize')}
            </button>

            {expanded && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-not-allowed items-start gap-3 rounded-xl border-2 border-sage-200 bg-porcelain/60 p-3 opacity-80">
                  <input
                    type="checkbox"
                    className="mt-1 accent-sage-500"
                    checked
                    disabled
                    aria-checked="true"
                  />
                  <div>
                    <div className="font-medium text-charcoal">
                      {t('cookie.essentials')}
                    </div>
                    <div className="text-sm text-charcoal/90">
                      {t('cookie.alwaysOn')}
                    </div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-sage-200 bg-porcelain/60 p-3 transition-colors hover:border-sage-300">
                  <input
                    type="checkbox"
                    className="mt-1 accent-sage-500"
                    checked={media}
                    onChange={(e) => setMedia(e.currentTarget.checked)}
                  />
                  <div>
                    <div className="font-medium text-charcoal">
                      {t('cookie.mediaTitle')}
                    </div>
                    <div className="text-sm text-charcoal/90">
                      {t('cookie.mediaDesc')}
                    </div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-sage-200 bg-porcelain/60 p-3 transition-colors hover:border-sage-300 sm:col-span-2">
                  <input
                    type="checkbox"
                    className="mt-1 accent-sage-500"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.currentTarget.checked)}
                  />
                  <div>
                    <div className="font-medium text-charcoal">
                      {t('cookie.analyticsTitle')}
                    </div>
                    <div className="text-sm text-charcoal/90">
                      {t('cookie.analyticsDesc')}
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              className="sm:w-auto"
              onClick={() => {
                saveConsent({
                  ...defaultConsent(),
                  media: false,
                  analytics: false,
                })
                setIsOpen(false)
              }}
            >
              {t('cookie.decline')}
            </Button>

            <Button
              className="sm:w-auto"
              onClick={() => {
                saveConsent({
                  version: CONSENT_VERSION,
                  essential: true,
                  media: true,
                  analytics: true,
                  ts: Date.now(),
                })
                setIsOpen(false)
              }}
            >
              {t('cookie.acceptAll')}
            </Button>

            <Button
              className="sm:w-auto"
              onClick={() => {
                saveConsent({
                  version: CONSENT_VERSION,
                  essential: true,
                  media,
                  analytics,
                  ts: Date.now(),
                })
                setIsOpen(false)
              }}
            >
              {t('cookie.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(ui, document.body)
}
