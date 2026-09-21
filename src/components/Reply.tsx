import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { copy } from '@shared/copy'
import { CONFIG } from '@shared/config'
import type { Reply as ReplyData } from '@shared/types'
import { api } from '../lib/api'
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

export default function Reply({ date, prompt, initial, onSaved }: Props) {
  const [saved, setSaved] = useState<ReplyData | null>(initial)
  const [editing, setEditing] = useState(!initial)
  const [text, setText] = useState(() => initial?.text ?? getDraft(date))
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [flash, setFlash] = useState(false)
  const area = useRef<HTMLTextAreaElement>(null)

  const grow = () => {
    const el = area.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }
  useLayoutEffect(grow, [text, editing])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(false), 4000)
    return () => clearTimeout(t)
  }, [flash])

  const change = (v: string) => {
    setText(v)
    if (!saved) setDraft(date, v)
  }

  const send = async () => {
    const value = text.trim()
    if (!value || status === 'sending') return
    setStatus('sending')
    try {
      const { reply } = await api.reply(date, value)
      setSaved(reply)
      setEditing(false)
      setStatus('idle')
      setFlash(true)
      setDraft(date, '')
      onSaved()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="border-t border-rule pt-10">
      {saved && !editing ? (
        <div>
          <p className="label mb-5">{copy.yourReply}</p>
          <p className="whitespace-pre-wrap text-pretty font-serif text-[1.75rem] leading-[1.45] text-ink">
            {saved.text}
          </p>
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
          <div className="mt-4 flex items-center justify-between gap-4">
            <p role="alert" className="font-serif text-[1.25rem] text-accent">
              {status === 'error' ? copy.replyError : ''}
            </p>
            <div className="flex items-center gap-5">
              {saved && (
                <button
                  className="quiet-button !text-mute"
                  onClick={() => {
                    setText(saved.text)
                    setEditing(false)
                  }}
                >
                  Annuler
                </button>
              )}
              <button className="quiet-button" disabled={!text.trim() || status === 'sending'} onClick={send}>
                {status === 'sending' ? copy.replySending : copy.replyButton}
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
