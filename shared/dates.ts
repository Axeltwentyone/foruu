const DAY_MS = 86_400_000

const isoToUtc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Date du jour (AAAA-MM-JJ) dans un fuseau horaire donné. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export const isISODate = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(isoToUtc(s))

export const daysBetween = (from: string, to: string) =>
  Math.round((isoToUtc(to) - isoToUtc(from)) / DAY_MS)

export function eachDay(start: string, end: string): string[] {
  const out: string[] = []
  const n = daysBetween(start, end)
  const t0 = isoToUtc(start)
  for (let i = 0; i <= n; i++) out.push(new Date(t0 + i * DAY_MS).toISOString().slice(0, 10))
  return out
}

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...opts }).format(isoToUtc(iso))

export const formatDayMonth = (iso: string) => fmt(iso, { day: 'numeric', month: 'long' })
export const formatLong = (iso: string) => fmt(iso, { day: 'numeric', month: 'long', year: 'numeric' })
export const formatShort = (iso: string) => fmt(iso, { day: 'numeric', month: 'short' })
export const formatMonth = (iso: string) => fmt(iso, { month: 'long', year: 'numeric' })
