import { CONFIG } from '../shared/config.js'
import { daysBetween, isISODate, todayIn } from '../shared/dates.js'
import type { Phase } from '../shared/types.js'

/** "Aujourd'hui" chez elle. FAKE_TODAY (hors production) permet de prévisualiser un jour. */
export function getToday(): string {
  const fake = process.env.FAKE_TODAY
  if (fake && !process.env.VERCEL && isISODate(fake)) return fake
  return todayIn(CONFIG.timezone)
}

export function getPhase(today: string): Phase {
  if (today < CONFIG.start) return 'before'
  if (today > CONFIG.end) return 'ended'
  return 'running'
}

export const inRange = (date: string) => date >= CONFIG.start && date <= CONFIG.end

export const daysLeft = (today: string) => Math.max(0, daysBetween(today, CONFIG.end))
