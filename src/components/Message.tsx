import { useEffect, useRef } from 'react'
import { CONFIG } from '@shared/config'
import type { DayEntry, EntryType, RevealMode } from '@shared/types'
import { fontsReady, gsap, reducedMotion, SplitText } from '../lib/motion'
import Voice from './Voice'

/** slow = première ouverture du jour · fast = retour/relecture · instant = sans animation */
export type Pace = 'slow' | 'fast' | 'instant'

const DEFAULT_REVEAL: Record<EntryType, RevealMode> = {
  letter: 'lines',
  word: 'typing',
  line: 'words',
  question: 'words',
  quote: 'lines',
  memory: 'lines',
  photo: 'lines',
  voice: 'lines',
}

const LABELS: Partial<Record<EntryType, string>> = {
  question: 'Une question',
  memory: 'Un souvenir',
  quote: 'Une pensée',
  voice: 'Une note vocale',
}

// Un mot court se lit en énorme ; un mot long doit encore tenir sur un téléphone.
const wordSize = (w: string) => {
  const n = w.length
  const vw = n <= 4 ? 30 : n <= 6 ? 24 : n <= 8 ? 18 : n <= 11 ? 14 : 10
  return `min(${vw}vw, ${vw * 0.42}rem)`
}

interface Props {
  entry: DayEntry
  pace: Pace
  onDone: () => void
}

export default function Message({ entry, pace, onDone }: Props) {
  const root = useRef<HTMLElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const reveal = entry.reveal ?? DEFAULT_REVEAL[entry.type]

  useEffect(() => {
    const el = root.current
    if (!el) return
    let cancelled = false

    if (pace === 'instant' || reducedMotion()) {
      gsap.set(el, { opacity: 1 })
      onDoneRef.current()
      return
    }

    const ctx = gsap.context(() => {}, el)
    fontsReady().then(() => {
      if (cancelled) return
      ctx.add(() => {
        const k = pace === 'fast' ? 0.35 : 1
        const texts = gsap.utils.toArray<HTMLElement>('[data-text]', el)
        const early = gsap.utils.toArray<HTMLElement>('[data-early]', el)
        const late = gsap.utils.toArray<HTMLElement>('[data-late]', el)
        const from = { y: 12, filter: 'blur(8px)' }
        const to = { opacity: 1, y: 0, filter: 'blur(0px)' }

        const groups = texts.map((t) => {
          const split = SplitText.create(t, { type: reveal === 'typing' ? 'words,chars' : reveal })
          const targets = reveal === 'typing' ? split.chars : reveal === 'words' ? split.words : split.lines
          return { split, targets }
        })
        gsap.set([...early, ...late], { opacity: 0 })
        gsap.set(
          groups.flatMap((g) => g.targets),
          { opacity: 0 },
        )
        gsap.set(el, { opacity: 1 })

        const t = gsap.timeline({
          defaults: { ease: 'power2.out' },
          onComplete: () => {
            groups.forEach((g) => g.split.revert())
            onDoneRef.current()
          },
        })
        tl.current = t

        if (early.length) t.to(early, { ...to, duration: 1.8 * k, stagger: 0.25 * k, startAt: { y: 10, filter: 'blur(12px)' } }, 0)

        groups.forEach(({ targets }, i) => {
          const at = i === 0 ? 0.5 * k : `>+${0.3 * k}`
          if (reveal === 'typing') {
            const step = Math.min(0.06, 6 / Math.max(targets.length, 1)) * k
            t.to(targets, { opacity: 1, duration: 0.01, stagger: step, ease: 'none' }, at)
          } else if (reveal === 'words') {
            t.to(targets, { ...to, duration: 1.2 * k, stagger: Math.min(0.11, 4 / targets.length) * k, startAt: from }, at)
          } else {
            t.to(targets, { ...to, duration: 1.6 * k, stagger: Math.min(0.65, 3.5 / targets.length) * k, startAt: from }, at)
          }
        })

        if (late.length) t.to(late, { ...to, duration: 1.6 * k, stagger: 0.3 * k, startAt: from }, `>+${0.3 * k}`)

        // Une longue lettre ne doit pas mettre une minute à s'écrire.
        const cap = pace === 'fast' ? 6 : 16
        if (t.duration() > cap) t.timeScale(t.duration() / cap)
      })
    })

    return () => {
      cancelled = true
      tl.current = null
      ctx.revert()
    }
  }, [reveal, pace])

  const paragraphs = entry.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const sig = entry.signature ?? (entry.type === 'letter' || entry.type === 'memory')
  const signature = typeof sig === 'string' ? sig : sig ? CONFIG.sender : null
  const label = entry.label ?? LABELS[entry.type]

  const body = 'whitespace-pre-line text-pretty font-serif text-[1.85rem] leading-[1.5] sm:text-[2.05rem]'

  return (
    <article
      ref={root}
      onClick={() => tl.current?.timeScale(6)}
      style={{ opacity: pace === 'instant' ? 1 : 0 }}
      className="w-full"
    >
      {entry.type === 'word' ? (
        <div className="flex min-h-[46dvh] items-center">
          <p
            data-text
            style={{ fontSize: wordSize(entry.content) }}
            className="hyphens-auto break-words font-display italic leading-[0.95] tracking-tight"
          >
            {entry.content}
          </p>
        </div>
      ) : (
        <>
          {(label || (entry.type === 'memory' && entry.attribution)) && (
            <p data-early className="label mb-9">
              {label}
              {entry.type === 'memory' && entry.attribution ? ` · ${entry.attribution}` : ''}
            </p>
          )}

          {entry.title && (
            <h2 data-text className="mb-10 text-balance font-display text-[2.9rem] leading-[1.1] sm:text-6xl">
              {entry.title}
            </h2>
          )}

          {entry.type === 'quote' && <span data-early aria-hidden className="mb-8 block h-px w-10 bg-accent" />}

          {entry.type === 'photo' && entry.media?.kind === 'image' && (
            <figure data-early className="mb-7">
              <img src={entry.media.src} alt={entry.media.alt ?? ''} className="h-auto w-full rounded-[2px]" />
            </figure>
          )}

          {(entry.type === 'line' || entry.type === 'question' || entry.type === 'quote') &&
            paragraphs.map((p, i) => (
              <p
                key={i}
                data-text
                className={`text-balance font-display italic ${
                  entry.type === 'question'
                    ? 'text-[2.2rem] leading-[1.18] not-italic sm:text-[2.8rem]'
                    : 'text-[2.35rem] leading-[1.14] sm:text-[3.1rem]'
                } ${i > 0 ? 'mt-7' : ''}`}
              >
                {p}
              </p>
            ))}

          {(entry.type === 'letter' || entry.type === 'memory' || entry.type === 'voice') &&
            paragraphs.map((p, i) => (
              <p key={i} data-text className={`${body} ${i > 0 ? 'mt-7' : ''}`}>
                {p}
              </p>
            ))}

          {entry.type === 'photo' &&
            paragraphs.map((p, i) => (
              <p key={i} data-text className="font-serif text-[1.5rem] leading-snug text-mute">
                {p}
              </p>
            ))}

          {entry.type === 'voice' && entry.media?.kind === 'audio' && (
            <div data-early className="mt-10">
              <Voice src={entry.media.src} />
            </div>
          )}

          {entry.type === 'quote' && entry.attribution && (
            <p data-late className="label mt-8">
              {entry.attribution}
            </p>
          )}
        </>
      )}

      {signature && (
        <p data-late className="mt-14 whitespace-pre-line text-right font-display text-[2.3rem] leading-[1.25] sm:text-[2.6rem]">
          {signature}
        </p>
      )}
    </article>
  )
}
