import { days } from '../content/days.js'
import { isISODate } from '../shared/dates.js'
import type { DayResponse } from '../shared/types.js'
import { getToday, inRange } from '../server/clock.js'
import { json } from '../server/http.js'
import { getStore } from '../server/store.js'

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get('date')
  if (!isISODate(date) || !inRange(date)) return json({ error: 'bad_date' }, 400)

  // La règle centrale : jamais un jour futur.
  if (date > getToday()) return json({ error: 'locked' }, 403)

  let reply = null
  try {
    reply = await getStore().get(date)
  } catch {
    // idem : on affiche le message même si les réponses sont indisponibles
  }

  const body: DayResponse = {
    date,
    entry: days.find((d) => d.date === date) ?? null,
    reply,
  }
  return json(body)
}
