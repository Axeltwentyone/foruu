import { isISODate } from '../shared/dates.js'
import { getToday, inRange } from '../server/clock.js'
import { isAcceptedImage, MAX_UPLOAD_BYTES, saveReplyPhoto } from '../server/images.js'
import { json } from '../server/http.js'

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
  if (!isAcceptedImage(file.type)) return json({ error: 'bad_type' }, 400)

  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const url = await saveReplyPhoto(date, bytes, file.type)
    return json({ url })
  } catch (e) {
    console.error('upload failed', e)
    return json({ error: 'upload_failed' }, 503)
  }
}
