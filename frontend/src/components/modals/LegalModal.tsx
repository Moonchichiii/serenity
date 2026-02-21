import { Suspense, lazy, useMemo } from 'react'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'
import { useTranslation } from 'react-i18next'

type LegalPageKey = 'legal' | 'privacy' | 'cookies' | 'terms' | 'accessibility'

const LegalNotice = lazy(() => import('@/components/legal/LegalNotice').then(m => ({ default: m.LegalNotice })))
const PrivacyPolicy = lazy(() => import('@/components/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })))
const CookiePolicy = lazy(() => import('@/components/legal/CookiePolicy').then(m => ({ default: m.CookiePolicy })))
const TermsAndConditions = lazy(() => import('@/components/legal/TermsAndConditions').then(m => ({ default: m.TermsAndConditions })))
const AccessibilityStatement = lazy(() => import('@/components/legal/AccessibilityStatement').then(m => ({ default: m.AccessibilityStatement })))

export function LegalModal() {
  const { t } = useTranslation()
  const { isOpen, close, getPayload } = useModal()

  const open = isOpen('legal')
  const page = (getPayload('legal')?.page ?? 'legal') as LegalPageKey

  const Title = useMemo(() => {
    switch (page) {
      case 'privacy':
        return t('legalPages.privacy.title')
      case 'cookies':
        return t('legalPages.cookies.title')
      case 'terms':
        return t('legalPages.terms.title')
      case 'accessibility':
        return t('legalPages.accessibility.title')
      case 'legal':
      default:
        return t('legalPages.legal.title')
    }
  }, [page, t])

  const Content = useMemo(() => {
    switch (page) {
      case 'privacy':
        return PrivacyPolicy
      case 'cookies':
        return CookiePolicy
      case 'terms':
        return TermsAndConditions
      case 'accessibility':
        return AccessibilityStatement
      case 'legal':
      default:
        return LegalNotice
    }
  }, [page])

  return (
    <Modal
      isOpen={open}
      onClose={() => close('legal')}
      title={Title}
      className="max-w-4xl"
    >
      <Suspense fallback={<div className="p-6 text-center text-charcoal/70">Loading…</div>}>
        <Content />
      </Suspense>
    </Modal>
  )
}
