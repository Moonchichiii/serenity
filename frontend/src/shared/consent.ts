// src/shared/consent.ts
export type Consent = {
  version: number
  essential: boolean   // keep true in practice
  media: boolean
  analytics: boolean
  ts: number
}

export const CONSENT_STORAGE_KEY = 'cookieConsent'
export const CONSENT_VERSION = 1

export function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as Consent
    if (!c || c.version !== CONSENT_VERSION) return null
    return c
  } catch {
    return null
  }
}

export function saveConsent(c: Consent) {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(c))
  window.dispatchEvent(new CustomEvent('serenity:consent', { detail: c }))
}

export function onConsentChange(handler: (c: Consent) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<Consent>).detail)
  window.addEventListener('serenity:consent', fn as EventListener)
  return () => window.removeEventListener('serenity:consent', fn as EventListener)
}

export function defaultConsent(): Consent {
  return {
    version: CONSENT_VERSION,
    essential: true,
    media: false,
    analytics: false,
    ts: Date.now(),
  }
}
