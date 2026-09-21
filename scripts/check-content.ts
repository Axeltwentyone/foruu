import { days } from '../content/days.js'
import { CONFIG } from '../shared/config.js'
import { eachDay, formatShort } from '../shared/dates.js'

const all = eachDay(CONFIG.start, CONFIG.end)
const byDate = new Map(days.map((d) => [d.date, d]))
const problems: string[] = []

for (const d of days) {
  if (!all.includes(d.date)) problems.push(`${d.date}  hors de la période (${CONFIG.start} → ${CONFIG.end})`)
}
if (byDate.size !== days.length) problems.push('Une même date apparaît plusieurs fois.')

const missing: string[] = []
const placeholders: string[] = []
const noMedia: string[] = []

for (const date of all) {
  const e = byDate.get(date)
  if (!e) {
    missing.push(date)
    continue
  }
  const text = [e.content, e.title, e.intro, e.attribution, e.replyPrompt, e.media?.caption].join(' ')
  if (text.includes('[À REMPLACER]')) placeholders.push(date)
  if ((e.type === 'photo' || e.type === 'voice') && !e.media) noMedia.push(date)
}

const list = (dates: string[]) => dates.map((d) => `${d} (${formatShort(d)})`).join(', ')

console.log(`\nPériode : ${CONFIG.start} → ${CONFIG.end} — ${all.length} jours, ${days.length} rédigés.\n`)
if (problems.length) console.log(`⚠  ${problems.join('\n⚠  ')}\n`)
if (placeholders.length) console.log(`✎  Encore des [À REMPLACER] : ${list(placeholders)}\n`)
if (noMedia.length) console.log(`▣  Photo/audio sans fichier : ${list(noMedia)}\n`)
if (missing.length) console.log(`○  Sans contenu : ${missing.length} jours, du ${missing[0]} au ${missing[missing.length - 1]}\n`)
if (!problems.length && !placeholders.length && !noMedia.length && !missing.length) console.log('Tout est prêt.\n')
