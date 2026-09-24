import { put } from '@vercel/blob'
import { isISODate } from '../shared/dates.js'
import { getToday, inRange } from '../server/clock.js'
import { MAX_UPLOAD_BYTES } from '../server/images.js'
import { json } from '../server/http.js'

const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp'])

// L'upload direct navigateur → Vercel Blob (@vercel/blob/client) se heurte à un bug
// CORS connu du SDK (vercel.com/api/blob bloqué par le navigateur, cf. forum Vercel).
// On repasse donc la photo par notre propre fonction : sans risque désormais que les
// photos soient réduites côté navigateur avant l'envoi (server/../src/lib/image.ts),
// bien en dessous de la limite de taille des fonctions serverless.
export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  const date = form.get('date')
  const file = form.get('file')
  if (!isISODate(date) || !inRange(date)) return json({ error: 'bad_date' }, 400)
  if (date > getToday()) return json({ error: 'locked' }, 403)
  if (!(file instanceof File)) return json({ error: 'no_file' }, 400)
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return json({ error: 'bad_size' }, 400)
  if (!ACCEPTED.has(file.type)) return json({ error: 'bad_type' }, 400)

  try {
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const name = `replies/${date}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    const blob = await put(name, file, { access: 'public', contentType: file.type, addRandomSuffix: false })
    return json({ url: blob.url })
  } catch (e) {
    console.error('upload failed', e)
    return json({ error: 'upload_failed', detail: e instanceof Error ? e.message : String(e) }, 503)
  }
}
