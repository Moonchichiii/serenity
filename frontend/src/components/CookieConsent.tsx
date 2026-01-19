import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useModal } from '@/shared/hooks/useModal'
import {
  getConsent,
  saveConsent,
  defaultConsent,
  CONSENT_VERSION,
  onCookieSettingsOpen,
} from '@/shared/consent'

export default function CookieConsent({
  className = '',
}: {
  className?: string
}) {
  const { t } = useTranslation()
  const { open: openModal } = useModal()

  // Read once at mount to check if we should show initially
  const initial = useMemo(() => getConsent(), [])

  // State
  const [isOpen, setIsOpen] = useState(!initial)
  const [expanded, setExpanded] = useState(false)
  const [media, setMedia] = useState(initial?.media ?? false)
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false)

  // Listen for the global "Open Settings" event
  useEffect(() => {
    return onCookieSettingsOpen(() => {
      // 1. Get fresh data from storage
      const latest = getConsent()
      // 2. Sync state
      setMedia(latest?.media ?? false)
      setAnalytics(latest?.analytics ?? false)
      // 3. Show UI in expanded mode
      setExpanded(true)
      setIsOpen(true)
    })
  }, [])

  if (!isOpen) return null

  return (
    <div
      className={[
        'pointer-events-none fixed inset-x-0 bottom-4 z-200 flex justify-center px-4',
        className,
      ].join(' ')}
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-2xl rounded-3xl border-2 border-sage-200 bg-white/95 backdrop-blur-md shadow-elevated">
        <div className="p-4 sm:p-5">
          <p className="text-sm sm:text-base text-charcoal/90">
            {t('cookie.intro')}{' '}
            <span className="font-medium">{t('cookie.mediaTitle')}</span>{' '}
            {t('and', { defaultValue: 'and' })}{' '}
            <span className="font-medium">{t('cookie.analyticsTitle')}</span>.
            {/* Replaced <a> with accessible button triggering Modal */}
            <button
              type="button"
              onClick={() => openModal('legal', { page: 'privacy' })}
              className="ml-1 warm-underline text-charcoal font-medium hover:text-charcoal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 rounded-sm"
            >
              {t('cookie.learnMore')}
            </button>
            .
          </p>

          <div className="mt-3">
            <button
              type="button"
              className="text-sm text-charcoal/80 underline underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 rounded-sm"
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
            >
              {expanded ? t('cookie.hideOptions') : t('cookie.customize')}
            </button>

            {expanded && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex items-start gap-3 rounded-xl border-2 border-sage-200 bg-porcelain/60 p-3 cursor-not-allowed opacity-80">
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
                    <div className="text-sm text-charcoal/70">
                      {t('cookie.alwaysOn')}
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border-2 border-sage-200 bg-porcelain/60 p-3 cursor-pointer hover:border-sage-300 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-1 accent-sage-500"
                    checked={media}
                    onChange={e => setMedia(e.currentTarget.checked)}
                  />
                  <div>
                    <div className="font-medium text-charcoal">
                      {t('cookie.mediaTitle')}
                    </div>
                    <div className="text-sm text-charcoal/70">
                      {t('cookie.mediaDesc')}
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border-2 border-sage-200 bg-porcelain/60 p-3 sm:col-span-2 cursor-pointer hover:border-sage-300 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-1 accent-sage-500"
                    checked={analytics}
                    onChange={e => setAnalytics(e.currentTarget.checked)}
                  />
                  <div>
                    <div className="font-medium text-charcoal">
                      {t('cookie.analyticsTitle')}
                    </div>
                    <div className="text-sm text-charcoal/70">
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
                const c = {
                  ...defaultConsent(),
                  media: false,
                  analytics: false,
                }
                saveConsent(c)
                setIsOpen(false)
              }}
            >
              {t('cookie.decline')}
            </Button>
            <Button
              className="sm:w-auto"
              onClick={() => {
                const c = {
                  version: CONSENT_VERSION,
                  essential: true,
                  media: true,
                  analytics: true,
                  ts: Date.now(),
                }
                saveConsent(c)
                setIsOpen(false)
              }}
            >
              {t('cookie.acceptAll')}
            </Button>
            <Button
              className="sm:w-auto"
              onClick={() => {
                const c = {
                  version: CONSENT_VERSION,
                  essential: true,
                  media,
                  analytics,
                  ts: Date.now(),
                }
                saveConsent(c)
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
}
