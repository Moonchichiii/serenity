import { useTranslation } from 'react-i18next'
import { LegalPageLayout } from './LegalPageLayout'

type PrivacySections = {
  controller: { title: string; body: string }
  data: { title: string; intro: string; items: string[] }
  purpose: { title: string; intro: string; items: string[]; highlight: string }
  retention: { title: string; items: string[] }
  processors: { title: string; intro: string; items: string[] }
  rights: { title: string; body: string }
}

export function PrivacyPolicy() {
  const { t } = useTranslation()
  const s = t('legalPages.privacy.sections', { returnObjects: true }) as PrivacySections

  return (
    <LegalPageLayout title={t('legalPages.privacy.title')}>
      <section aria-labelledby="controller">
        <h2 id="controller">{s.controller.title}</h2>
        <p>{s.controller.body}</p>
      </section>

      <section aria-labelledby="data">
        <h2 id="data">{s.data.title}</h2>
        <p>{s.data.intro}</p>
        <ul>{s.data.items.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <section aria-labelledby="purpose">
        <h2 id="purpose">{s.purpose.title}</h2>
        <p>{s.purpose.intro}</p>
        <ul>{s.purpose.items.map((x) => <li key={x}>{x}</li>)}</ul>
        <p className="mt-4 font-medium">{s.purpose.highlight}</p>
      </section>

      <section aria-labelledby="retention">
        <h2 id="retention">{s.retention.title}</h2>
        <ul>{s.retention.items.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <section aria-labelledby="processors">
        <h2 id="processors">{s.processors.title}</h2>
        <p>{s.processors.intro}</p>
        <ul>{s.processors.items.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <section aria-labelledby="rights">
        <h2 id="rights">{s.rights.title}</h2>
        <p>{s.rights.body}</p>
      </section>
    </LegalPageLayout>
  )
}
