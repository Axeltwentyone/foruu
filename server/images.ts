import { randomBytes } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { put } from '@vercel/blob'

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])

export const isAcceptedImage = (type: string) => ACCEPTED.has(type.toLowerCase())

/** Les iPhones envoient parfois du HEIC : aucun navigateur non-Apple ne l'affiche, donc on convertit en JPEG. */
async function toJpegIfHeic(buffer: Buffer, contentType: string): Promise<{ buffer: Buffer; contentType: string }> {
  if (contentType !== 'image/heic' && contentType !== 'image/heif') return { buffer, contentType }
  const convert = (await import('heic-convert')).default
  const out = await convert({ buffer, format: 'JPEG', quality: 0.85 })
  return { buffer: Buffer.from(out), contentType: 'image/jpeg' }
}

const extFor = (contentType: string) => (contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg')

/** Enregistre une photo envoyée dans une réponse et renvoie son URL publique. */
export async function saveReplyPhoto(date: string, bytes: Uint8Array, contentType: string): Promise<string> {
  const converted = await toJpegIfHeic(Buffer.from(bytes), contentType)
  const name = `${date}-${randomBytes(6).toString('hex')}.${extFor(converted.contentType)}`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`replies/${name}`, converted.buffer, {
      access: 'public',
      contentType: converted.contentType,
      addRandomSuffix: false,
    })
    return blob.url
  }

  // Dev local, sans Vercel Blob : on écrit dans public/uploads, servi tel quel par Vite.
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, name), converted.buffer)
  return `/uploads/${name}`
}
