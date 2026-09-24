const MAX_DIMENSION = 1920
const QUALITY = 0.82
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024 // déjà assez léger, inutile de réencoder

/** Réduit une photo de téléphone (souvent 3-15 Mo) à une taille raisonnable pour l'envoi. */
export async function shrinkImage(file: File): Promise<File> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return file // format que le navigateur ne sait pas décoder : on envoie tel quel
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
    bitmap.close()
    return file
  }

  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
  if (!blob) return file

  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
}
