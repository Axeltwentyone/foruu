import { isISODate } from '../shared/dates.js'
import { getToday, inRange } from '../server/clock.js'
import { json, readJson } from '../server/http.js'
import { getStore } from '../server/store.js'

const MAX_LENGTH = 5000

// Doit venir d'un upload direct vers notre store Vercel Blob (api/upload.ts).
const isOwnPhotoUrl = (url: string) => /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url)

export async function POST(req: Request) {
  const body = await readJson<{ date?: string; text?: string; photo?: string }>(req)
  const date = body?.date
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  const photo = typeof body?.photo === 'string' && isOwnPhotoUrl(body.photo) ? body.photo : undefined

  if (!isISODate(date) || !inRange(date)) return json({ error: 'bad_date' }, 400)
  if (date > getToday()) return json({ error: 'locked' }, 403)
  if ((!text && !photo) || text.length > MAX_LENGTH) return json({ error: 'bad_text' }, 400)

  try {
    const reply = await getStore().set(date, text, photo)
    return json({ reply })
  } catch (e) {
    console.error('reply save failed', e)
    return json({ error: 'store_unavailable' }, 503)
  }
}
