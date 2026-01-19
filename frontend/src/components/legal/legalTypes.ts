export type LegalSection =
  | { title: string; body: string }
  | { title: string; intro: string; items: string[]; highlight?: string; outro?: string }
  | { title: string; items: string[] }

export type LegalSectionsRecord = Record<string, LegalSection>

export type LegalPageKey = 'legal' | 'privacy' | 'cookies' | 'terms' | 'accessibility'

export type LegalPagesTranslation = {
  legalPages: Record<
    LegalPageKey,
    {
      title: string
      sections: LegalSectionsRecord
    }
  >
}
