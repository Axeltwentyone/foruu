import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { isISODate } from '../shared/dates.js'
import { getToday, inRange } from '../server/clock.js'
import { MAX_UPLOAD_BYTES } from '../server/images.js'
import { json } from '../server/http.js'

// Upload direct navigateur → Vercel Blob : le fichier ne passe jamais par cette
// fonction (qui ne fait que délivrer un jeton signé), donc pas de limite de
// taille de requête serverless à contourner.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let date: unknown
        try {
          date = JSON.parse(clientPayload ?? '{}').date
        } catch {
          date = null
        }
        if (!isISODate(date) || !inRange(date)) throw new Error('bad_date')
        if (date > getToday()) throw new Error('locked')

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: false,
        }
      },
    })
    return json(result)
  } catch (e) {
    console.error('upload token failed', e)
    const message = e instanceof Error ? e.message : 'upload_failed'
    return json({ error: message }, message === 'bad_date' ? 400 : message === 'locked' ? 403 : 400)
  }
}
