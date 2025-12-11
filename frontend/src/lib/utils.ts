import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

/**
 * Merge class names with Tailwind-aware precedence.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a Date using a locale-aware date-fns pattern.
 */
export function formatDate(
  date: Date,
  locale: 'fr' | 'en' = 'fr',
  formatStr = 'PPP',
): string {
  return format(date, formatStr, {
    locale: locale === 'fr' ? fr : enUS,
  })
}

/**
 * Return a time string in HH:mm (already normalized upstream).
 */
export function formatTime(time: string): string {
  return time
}

/**
 * Format a number or numeric string as a price.
 * Returns "€—" if the value is not a valid number.
 */
export function formatPrice(price: number | string, currency = '€'): string {
  const num = typeof price === 'string' ? Number(price) : price
  if (Number.isNaN(num)) return `${currency}—`
  return `${currency}${num.toFixed(0)}`
}

/**
 * Smooth-scroll to an element by id, with a pixel offset from the top.
 */
export function scrollToElement(id: string, offset = 80) {
  if (typeof window === 'undefined') return

  const element = document.getElementById(id)
  if (!element) return

  const y = element.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({ top: y, behavior: 'smooth' })
}

/**
 * Derive up to two initials from a full name.
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
}

/**
 * Check whether a given Date is strictly in the past.
 */
export function isPastDate(date: Date): boolean {
  return date.getTime() < Date.now()
}

/**
 * Basic time-slot availability check.
 * Placeholder until real availability is wired to the API.
 */
export function isTimeSlotAvailable(date: Date, _time: string): boolean {
  return !isPastDate(date)
}
