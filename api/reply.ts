import { isISODate } from '../shared/dates.js'
import { getToday, inRange } from '../server/clock.js'
import { json, readJson } from '../server/http.js'
import { getStore } from '../server/store.js'

const MAX_LENGTH = 5000

export async function POST(req: Request) {
  const body = await readJson<{ date?: string; text?: string }>(req)
  const date = body?.date
  const text = typeof body?.text === 'string' ? body.text.trim() : ''

  if (!isISODate(date) || !inRange(date)) return json({ error: 'bad_date' }, 400)
  if (date > getToday()) return json({ error: 'locked' }, 403)
  if (!text || text.length > MAX_LENGTH) return json({ error: 'bad_text' }, 400)

  try {
    const reply = await getStore().set(date, text)
    return json({ reply })
  } catch (e) {
    console.error('reply save failed', e)
    return json({ error: 'store_unavailable' }, 503)
  }
}
