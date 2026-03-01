import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { GiftForm } from "@/components/forms/GiftForm"
import { useHydratedCMS } from "@/hooks/useCMS"
import { useModal } from "@/components/modal/useModal"

export default function GiftVoucherModalScreen() {
  const { t, i18n } = useTranslation()
  const { close } = useModal()
  const { data } = useHydratedCMS()

  const giftSettings = data?.globals?.gift ?? null
  const lang: "en" | "fr" = i18n.language.startsWith("fr") ? "fr" : "en"

  const body = useMemo(() => {
    if (!giftSettings) return t("gift.subtitle")
    return lang === "fr"
      ? giftSettings.modal_text_fr
      : giftSettings.modal_text_en
  }, [giftSettings, lang, t])

  return (
    <div className="space-y-4">
      <p className="text-charcoal/70 whitespace-pre-line">{body}</p>
      <GiftForm onSuccess={close} settings={giftSettings} />
    </div>
  )
}
