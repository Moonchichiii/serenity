import { useTranslation } from 'react-i18next'
import { LegalPageLayout } from './LegalPageLayout'
import type { LegalPagesTranslation } from './legalTypes'

type LegalNoticeSections = LegalPagesTranslation['legalPages']['legal']['sections'] & {
  publisher: { title: string; intro: string; items: string[] }
  hosting: { title: string; intro: string; items: string[]; outro: string }
  ip: { title: string; body: string }
}

export function LegalNotice() {
  const { t } = useTranslation()

  const s = t('legalPages.legal.sections', { returnObjects: true }) as LegalNoticeSections

  return (
    <LegalPageLayout title={t('legalPages.legal.title')}>
      <section aria-labelledby="publisher">
        <h2 id="publisher">{s.publisher.title}</h2>
        <p>{s.publisher.intro}</p>
        <ul>
          {s.publisher.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="hosting">
        <h2 id="hosting">{s.hosting.title}</h2>
        <p>{s.hosting.intro}</p>
        <ul>
          {s.hosting.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{s.hosting.outro}</p>
      </section>

      <section aria-labelledby="ip">
        <h2 id="ip">{s.ip.title}</h2>
        <p>{s.ip.body}</p>
      </section>
    </LegalPageLayout>
  )
}
