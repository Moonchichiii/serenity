import Modal from '@/components/ui/Modal'
import { useModal } from '@/shared/hooks/useModal'
import { GiftForm } from '@/components/forms/GiftForm'
import { useTranslation } from 'react-i18next'

export default function GiftVoucherModal() {
  const { isOpen, close } = useModal()
  const { t } = useTranslation()

  return (
    <Modal
      isOpen={isOpen('gift')}
      onClose={() => close('gift')}
      title={t('gift.title')}
      scrollable
      className="w-[96vw] max-w-lg"
    >
      <div className="mb-6">
        <p className="text-charcoal/70">
          {t('gift.subtitle')}
        </p>
      </div>

      <GiftForm onSuccess={() => close('gift')} />
    </Modal>
  )
}
