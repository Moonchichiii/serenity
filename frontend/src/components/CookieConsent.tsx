// src/components/CookieConsent.tsx
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import {
  getConsent,
  saveConsent,
  defaultConsent,
  CONSENT_VERSION,
} from '@/shared/consent'

export default function CookieConsent({
  className = '',
  policyHref = '/privacy',
}: {
  className?: string
  policyHref?: string
}) {
  const { t } = useTranslation()
  const existing = useMemo(() => getConsent(), [])
  const [open, setOpen] = useState(!existing)
  const [expanded, setExpanded] = useState(false)
  const [media, setMedia] = useState(existing?.media ?? false)
  const [analytics, setAnalytics] = useState(existing?.analytics ?? false)

  useEffect(() => setOpen(!existing), [existing])

  if (!open) return null

  return (
    <div
      className={[
        'pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4',
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
            <span className="font-medium">{t('cookie.analyticsTitle')}</span>.{' '}
            <a href={policyHref} className="warm-underline text-charcoal">
              {t('cookie.learnMore')}
            </a>
            .
          </p>

          <div className="mt-3">
            <button
              type="button"
              className="text-sm text-charcoal/80 underline underline-offset-4 hover:text-charcoal"
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
            >
              {expanded ? t('cookie.hideOptions') : t('cookie.customize')}
            </button>

            {expanded && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex items-start gap-3 rounded-xl border-2 border-sage-200 bg-porcelain/60 p-3">
                  <input type="checkbox" className="mt-1" checked disabled aria-checked="true" />
                  <div>
                    <div className="font-medium text-charcoal">{t('cookie.essentials')}</div>
                    <div className="text-sm text-charcoal/70">{t('cookie.alwaysOn')}</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border-2 border-sage-200 bg-porcelain/60 p-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={media}
                    onChange={e => setMedia(e.currentTarget.checked)}
                  />
                  <div>
                    <div className="font-medium text-charcoal">{t('cookie.mediaTitle')}</div>
                    <div className="text-sm text-charcoal/70">{t('cookie.mediaDesc')}</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border-2 border-sage-200 bg-porcelain/60 p-3 sm:col-span-2">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={analytics}
                    onChange={e => setAnalytics(e.currentTarget.checked)}
                  />
                  <div>
                    <div className="font-medium text-charcoal">{t('cookie.analyticsTitle')}</div>
                    <div className="text-sm text-charcoal/70">{t('cookie.analyticsDesc')}</div>
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
                const c = { ...defaultConsent(), media: false, analytics: false }
                saveConsent(c)
                setOpen(false)
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
                setOpen(false)
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
                setOpen(false)
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
