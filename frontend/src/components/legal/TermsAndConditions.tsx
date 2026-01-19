import { useTranslation } from 'react-i18next'
import { LegalPageLayout } from './LegalPageLayout'

type TermsSections = {
  object: { title: string; body: string }
  nature: { title: string; body: string }
  pricing: { title: string; body: string }
  cancellation: { title: string; items: string[] }
  vouchers: { title: string; body: string }
  contraindications: { title: string; body: string }
}

export function TermsAndConditions() {
  const { t } = useTranslation()
  const s = t('legalPages.terms.sections', { returnObjects: true }) as TermsSections

  return (
    <LegalPageLayout title={t('legalPages.terms.title')}>
      <section aria-labelledby="object">
        <h2 id="object">{s.object.title}</h2>
        <p>{s.object.body}</p>
      </section>

      <section aria-labelledby="nature">
        <h2 id="nature">{s.nature.title}</h2>
        <p>{s.nature.body}</p>
      </section>

      <section aria-labelledby="pricing">
        <h2 id="pricing">{s.pricing.title}</h2>
        <p>{s.pricing.body}</p>
      </section>

      <section aria-labelledby="cancellation">
        <h2 id="cancellation">{s.cancellation.title}</h2>
        <ul>{s.cancellation.items.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <section aria-labelledby="vouchers">
        <h2 id="vouchers">{s.vouchers.title}</h2>
        <p>{s.vouchers.body}</p>
      </section>

      <section aria-labelledby="contraindications">
        <h2 id="contraindications">{s.contraindications.title}</h2>
        <p>{s.contraindications.body}</p>
      </section>
    </LegalPageLayout>
  )
}
