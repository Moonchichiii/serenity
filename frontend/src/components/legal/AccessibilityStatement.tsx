import { useTranslation } from 'react-i18next'
import { LegalPageLayout } from './LegalPageLayout'

type AccessibilitySections = {
  commitment: { title: string; body: string }
  standard: { title: string; intro: string; items: string[] }
  feedback: { title: string; body: string }
}

export function AccessibilityStatement() {
  const { t } = useTranslation()
  const s = t('legalPages.accessibility.sections', { returnObjects: true }) as AccessibilitySections

  return (
    <LegalPageLayout title={t('legalPages.accessibility.title')}>
      <section aria-labelledby="commitment">
        <h2 id="commitment">{s.commitment.title}</h2>
        <p>{s.commitment.body}</p>
      </section>

      <section aria-labelledby="standard">
        <h2 id="standard">{s.standard.title}</h2>
        <p>{s.standard.intro}</p>
        <ul>{s.standard.items.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <section aria-labelledby="feedback">
        <h2 id="feedback">{s.feedback.title}</h2>
        <p>{s.feedback.body}</p>
      </section>
    </LegalPageLayout>
  )
}
