import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date, locale: 'fr' | 'en' = 'fr', formatStr = 'PPP'): string {
  return format(date, formatStr, {
    locale: locale === 'fr' ? fr : enUS,
  })
}

/**
 * Format time
 */
export function formatTime(time: string): string {
  return time // Already in HH:mm format
}

/**
 * Format price
 */
export function formatPrice(price: number | string, currency = '€'): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return `${currency}${num.toFixed(0)}`
}

/**
 * Scroll to element smoothly
 */
export function scrollToElement(id: string, offset = 80) {
  const element = document.getElementById(id)
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date()
}

/**
 * Check if time slot is available (basic check)
 */
export function isTimeSlotAvailable(date: Date, time: string): boolean {
  // TODO: Implement real availability check with API
  return !isPastDate(date)
}