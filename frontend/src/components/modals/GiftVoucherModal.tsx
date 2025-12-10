import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/shared/hooks/useModal'
import { GiftForm } from '@/components/forms/GiftForm'
import { useTranslation } from 'react-i18next'
import { cmsAPI } from '@/api/cms'
import type { GlobalSettings } from '@/api/cms'

export default function GiftVoucherModal() {
  const { isOpen, close } = useModal()
  const { t, i18n } = useTranslation()
  const [giftSettings, setGiftSettings] = useState<GlobalSettings['gift'] | null>(null)

  useEffect(() => {
    cmsAPI
      .getGlobals()
      .then(res => setGiftSettings(res.gift))
      .catch(() => setGiftSettings(null))
  }, [])

  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en'

  // Resolve title and body text:
  const title = giftSettings
    ? (lang === 'fr' ? giftSettings.modal_title_fr : giftSettings.modal_title_en)
    : t('gift.title')

  const body = giftSettings
    ? (lang === 'fr' ? giftSettings.modal_text_fr : giftSettings.modal_text_en)
    : t('gift.subtitle')

  return (
    <Modal
      isOpen={isOpen('gift')}
      onClose={() => close('gift')}
      title={title}
      scrollable
      className="w-[96vw] max-w-lg"
    >
      <div className="mb-6">
        <p className="text-charcoal/70 whitespace-pre-line">
          {body}
        </p>
      </div>

      <GiftForm onSuccess={() => close('gift')} />
    </Modal>
  )
}
