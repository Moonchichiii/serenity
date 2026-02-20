export function getLocalizedText(
  obj: unknown,
  field: string,
  lang: 'en' | 'fr'
): string {
  if (!obj || typeof obj !== 'object') return ''
  const key = `${field}_${lang}`
  return ((obj as Record<string, unknown>)[key] as string) || ''
}
