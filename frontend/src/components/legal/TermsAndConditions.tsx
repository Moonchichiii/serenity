import { useTranslation } from 'react-i18next'
import { LegalPageLayout } from './LegalPageLayout'

type TermsSections = {
  object: { title: string; body: string }
  nature: { title: string; body: string }
  pricing: { title: string; body: string }
  payments: { title: string; body: string }
  withdrawal: { title: string; body: string; exception: string }
  cancellation: { title: string; items: string[] }
  vouchers: { title: string; body: string }
  contraindications: { title: string; body: string }
  mediation: { title: string; body: string }
}

export function TermsAndConditions() {
  const { t } = useTranslation()
  const s = t('legalPages.terms.sections', {
    returnObjects: true,
  }) as TermsSections

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

      <section aria-labelledby="payments">
        <h2 id="payments">{s.payments.title}</h2>
        <p>{s.payments.body}</p>
      </section>

      <section aria-labelledby="withdrawal">
        <h2 id="withdrawal">{s.withdrawal.title}</h2>
        <p>{s.withdrawal.body}</p>
        <p className="mt-4 font-medium">{s.withdrawal.exception}</p>
      </section>

      <section aria-labelledby="cancellation">
        <h2 id="cancellation">{s.cancellation.title}</h2>
        <ul>
          {s.cancellation.items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="vouchers">
        <h2 id="vouchers">{s.vouchers.title}</h2>
        <p>{s.vouchers.body}</p>
      </section>

      <section aria-labelledby="contraindications">
        <h2 id="contraindications">{s.contraindications.title}</h2>
        <p>{s.contraindications.body}</p>
      </section>

      <section aria-labelledby="mediation">
        <h2 id="mediation">{s.mediation.title}</h2>
        <p>{s.mediation.body}</p>
      </section>
    </LegalPageLayout>
  )
}
