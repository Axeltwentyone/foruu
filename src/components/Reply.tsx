import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { copy } from '@shared/copy'
import { CONFIG } from '@shared/config'
import type { Reply as ReplyData } from '@shared/types'
import { api } from '../lib/api'
import { shrinkImage } from '../lib/image'
import { getDraft, setDraft } from '../lib/storage'

interface Props {
  date: string
  prompt: string
  initial: ReplyData | null
  onSaved: () => void
}

const stamp = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    timeZone: CONFIG.timezone,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

const MAX_BYTES = 15 * 1024 * 1024

export default function Reply({ date, prompt, initial, onSaved }: Props) {
  const [saved, setSaved] = useState<ReplyData | null>(initial)
  const [editing, setEditing] = useState(!initial)
  const [text, setText] = useState(() => initial?.text ?? getDraft(date))
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'converting' | 'uploading' | 'sending' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const area = useRef<HTMLTextAreaElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const grow = () => {
    const el = area.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }
  useLayoutEffect(grow, [text, editing])

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(false), 4000)
    return () => clearTimeout(t)
  }, [flash])

  const change = (v: string) => {
    setText(v)
    if (!saved) setDraft(date, v)
  }

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    if (file.size > MAX_BYTES) return setError(copy.photoTooBig)
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)) return setError(copy.photoBadType)

    setStatus('converting')
    try {
      if (/^image\/hei[cf]$/i.test(file.type)) {
        // La plupart des navigateurs (hors Safari/Apple) n'affichent pas le HEIC des iPhones.
        const heic2any = (await import('heic2any')).default
        const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
        file = new File([Array.isArray(out) ? out[0] : out], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
      }
      // Réduit une photo de téléphone (souvent plusieurs Mo) pour un envoi rapide.
      file = await shrinkImage(file)
    } catch {
      setStatus('idle')
      return setError(copy.photoBadType)
    }
    setStatus('idle')

    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    setPhoto(null)
    setPreview(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  const send = async () => {
    const value = text.trim()
    if ((!value && !photo) || status === 'uploading' || status === 'sending') return
    setError(null)
    try {
      let photoUrl: string | undefined
      if (photo) {
        setStatus('uploading')
        photoUrl = await api.uploadPhoto(date, photo)
      }
      setStatus('sending')
      const { reply } = await api.reply(date, value, photoUrl)
      setSaved(reply)
      setEditing(false)
      setStatus('idle')
      setFlash(true)
      setDraft(date, '')
      removePhoto()
      onSaved()
    } catch (e) {
      setStatus('error')
      const msg = e instanceof Error ? e.message.toLowerCase() : ''
      setError(
        msg.includes('large') || msg.includes('size')
          ? copy.photoTooBig
          : msg.includes('content type') || msg.includes('not allowed')
            ? copy.photoBadType
            : copy.replyError,
      )
    }
  }

  const busy = status === 'converting' || status === 'uploading' || status === 'sending'

  return (
    <section className="border-t border-rule pt-10">
      {saved && !editing ? (
        <div>
          <p className="label mb-5">{copy.yourReply}</p>
          {saved.photo && (
            <img
              src={saved.photo}
              alt=""
              className="mb-5 max-h-[28rem] w-full rounded-[2px] border border-rule/60 object-cover"
            />
          )}
          {saved.text && (
            <p className="whitespace-pre-wrap text-pretty font-serif text-[1.75rem] leading-[1.45] text-ink">
              {saved.text}
            </p>
          )}
          <div className="mt-6 flex items-center gap-5">
            <span className="label">{stamp(saved.updatedAt)}</span>
            {flash && (
              <span className="fade-away label flex items-center gap-1.5 !text-accent" role="status">
                <svg className="draw-check" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M2 6.4 4.8 9 10 3.2" />
                </svg>
                {copy.replySent}
              </span>
            )}
            <button className="quiet-button ml-auto" onClick={() => setEditing(true)}>
              {copy.replyEdit}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor={`reply-${date}`} className="block text-balance font-serif text-[1.8rem] leading-snug">
            {prompt}
          </label>
          <textarea
            ref={area}
            id={`reply-${date}`}
            value={text}
            rows={3}
            maxLength={5000}
            placeholder={copy.replyPlaceholder}
            onChange={(e) => change(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send()
            }}
            className="mt-6 block min-h-[8rem] w-full resize-none border-0 border-b border-rule bg-transparent pb-4 font-serif text-[1.75rem] leading-[1.4] outline-none transition-colors placeholder:text-mute/60 focus:border-accent"
          />

          {preview && (
            <div className="relative mt-5 inline-block">
              <img src={preview} alt="" className="max-h-[16rem] rounded-[2px] border border-rule/60" />
              <button
                type="button"
                onClick={removePhoto}
                aria-label={copy.removePhoto}
                className="absolute -right-2.5 -top-2.5 grid h-7 w-7 place-items-center rounded-full border border-rule bg-paper text-ink"
              >
                ×
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                className="hidden"
                onChange={(e) => pickPhoto(e.target.files?.[0])}
              />
              <button type="button" className="quiet-button" disabled={busy} onClick={() => fileInput.current?.click()}>
                {copy.addPhoto}
              </button>
            </div>
            <p role="alert" className="font-serif text-[1.25rem] text-accent">
              {status === 'converting' ? copy.photoConverting : status === 'uploading' ? copy.photoSending : error}
            </p>
            <div className="flex items-center gap-5">
              {saved && (
                <button
                  className="quiet-button !text-mute"
                  onClick={() => {
                    setText(saved.text)
                    removePhoto()
                    setError(null)
                    setEditing(false)
                  }}
                >
                  Annuler
                </button>
              )}
              <button className="quiet-button" disabled={(!text.trim() && !photo) || busy} onClick={send}>
                {status === 'uploading'
                  ? copy.photoSending
                  : status === 'sending'
                    ? copy.replySending
                    : status === 'converting'
                      ? copy.photoConverting
                      : copy.replyButton}
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
