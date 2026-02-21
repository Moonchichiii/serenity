export type Consent = {
  version: number
  essential: boolean
  media: boolean
  analytics: boolean
  ts: number
}

export const CONSENT_STORAGE_KEY = 'cookieConsent'
export const CONSENT_VERSION = 1
export const CONSENT_CHANGE_EVENT = 'serenity:consent'
export const CONSENT_SETTINGS_EVENT = 'serenity:cookie-settings'

declare global {
  interface WindowEventMap {
    'serenity:consent': CustomEvent<Consent>
    'serenity:cookie-settings': Event
  }
}

// Load consent from localStorage (returns null if missing/invalid).
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

// Persist consent and notify listeners.
export function saveConsent(c: Consent) {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(c))
  window.dispatchEvent(
    new CustomEvent<Consent>(CONSENT_CHANGE_EVENT, { detail: c }),
  )
}

// Subscribe to consent changes; returns an unsubscribe function.
export function onConsentChange(handler: (c: Consent) => void) {
  const fn = (e: WindowEventMap['serenity:consent']) => handler(e.detail)
  window.addEventListener(CONSENT_CHANGE_EVENT, fn)
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, fn)
}

// Default consent values for new users.
export function defaultConsent(): Consent {
  return {
    version: CONSENT_VERSION,
    essential: true,
    media: false,
    analytics: false,
    ts: Date.now(),
  }
}

// Request the Cookie Settings modal to open.
export function requestCookieSettingsOpen() {
  window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT))
}

// Listen for requests to open Cookie Settings; returns an unsubscribe function.
export function onCookieSettingsOpen(handler: () => void) {
  const fn = () => handler()
  window.addEventListener(CONSENT_SETTINGS_EVENT, fn)
  return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, fn)
}
