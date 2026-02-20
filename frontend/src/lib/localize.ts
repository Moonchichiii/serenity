/**
 * Unified helper for localized CMS content.
 * Returns primary language field, then falls back to secondary, then empty string.
 */
export function getLocalizedText(
  obj: unknown,
  field: string,
  lang: 'en' | 'fr'
): string {
  if (!obj || typeof obj !== 'object') return '';

  const rec = obj as Record<string, unknown>;
  const primary = rec[`${field}_${lang}`];
  const secondary = rec[`${field}_${lang === 'en' ? 'fr' : 'en'}`];

  if (typeof primary === 'string' && primary.trim() !== '') {
    return primary;
  }
  if (typeof secondary === 'string' && secondary.trim() !== '') {
    return secondary;
  }

  return '';
}
