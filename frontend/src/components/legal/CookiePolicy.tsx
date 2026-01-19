import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useModal } from '@/shared/hooks/useModal'

import { requestCookieSettingsOpen } from '@/shared/consent'

/** Renders the cookie policy content and provides a trigger to open cookie settings. */
export function CookiePolicy() {
  const { t } = useTranslation()
  const { close } = useModal()

  const sections = ['what', 'used', 'ads', 'consent'] as const

  const openCookieSettings = () => {
    // Close the legal modal first (otherwise cookie banner opens behind the overlay)
    close('legal')

    // Next tick so the overlay is removed before showing CookieConsent
    requestAnimationFrame(() => {
      requestCookieSettingsOpen()
    })
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-200 pb-4">
        <h2 className="font-heading text-2xl text-charcoal">
          {t('legalPages.cookies.title')}
        </h2>
      </div>

      <div className="space-y-6 text-charcoal/80 leading-relaxed">
        {sections.map((key) => (
          <section key={key} className="space-y-2">
            <h3 className="font-medium text-lg text-charcoal">
              {t(`legalPages.cookies.sections.${key}.title`)}
            </h3>

            {t(`legalPages.cookies.sections.${key}.body`, { defaultValue: '' }) && (
              <p>{t(`legalPages.cookies.sections.${key}.body`)}</p>
            )}

            {t(`legalPages.cookies.sections.${key}.intro`, { defaultValue: '' }) && (
              <p>{t(`legalPages.cookies.sections.${key}.intro`)}</p>
            )}

            {(
              t(`legalPages.cookies.sections.${key}.items`, {
                returnObjects: true,
                defaultValue: [],
              }) as string[]
            ).length > 0 && (
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {(
                  t(`legalPages.cookies.sections.${key}.items`, {
                    returnObjects: true,
                  }) as string[]
                ).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Cookie settings trigger */}
      <div className="pt-4 border-t border-sage-200">
        <button
          type="button"
          onClick={openCookieSettings}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sage-100 text-sage-800 font-medium hover:bg-sage-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500"
        >
          <Settings className="w-4 h-4" />
          {t('cookie.customize')}
        </button>
      </div>
    </div>
  )
}
