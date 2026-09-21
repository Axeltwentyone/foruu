import { useEffect, useRef, useState } from 'react'
import { copy } from '@shared/copy'
import { formatDayMonth } from '@shared/dates'
import { fontsReady, gsap, reducedMotion, SplitText } from '../lib/motion'

interface Props {
  date: string
  phrase: string
  onDone: () => void
}

/** Séquence d'ouverture : la date, puis la petite phrase. Un tap la passe. */
export default function Intro({ date, phrase, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const done = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const [hint, setHint] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    let cancelled = false

    const finish = () => {
      if (done.current) return
      done.current = true
      onDoneRef.current()
    }
    if (reducedMotion()) {
      finish()
      return
    }

    const ctx = gsap.context(() => {}, el)
    fontsReady().then(() => {
      if (cancelled) return
      ctx.add(() => {
        const dateEl = el.querySelector<HTMLElement>('[data-date]')!
        const phraseEl = el.querySelector<HTMLElement>('[data-phrase]')!
        const dateSplit = SplitText.create(dateEl, { type: 'words' })
        const phraseSplit = SplitText.create(phraseEl, { type: 'words' })

        gsap.set(el, { opacity: 1 })
        gsap.set(phraseEl, { opacity: 1 })
        gsap.set(phraseSplit.words, { opacity: 0 })

        tl.current = gsap
          .timeline({ defaults: { ease: 'power2.out' }, onComplete: finish })
          // 1. la date
          .from(dateSplit.words, {
            opacity: 0,
            filter: 'blur(10px)',
            y: 8,
            duration: 1.9,
            stagger: 0.35,
          })
          .to(dateEl, { opacity: 0, filter: 'blur(8px)', duration: 1, ease: 'power1.in' }, '+=1.1')
          // 2. la phrase
          .to(
            phraseSplit.words,
            { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.5, stagger: 0.22, startAt: { filter: 'blur(8px)', y: 10 } },
            '+=0.35',
          )
          .to({}, { duration: 2 })
          // 3. on s'efface, le message arrive
          .to(el, { opacity: 0, duration: 1.1, ease: 'power1.inOut' })

        gsap.delayedCall(2.6, () => !cancelled && setHint(true))
      })
    })

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [])

  const skip = () => {
    const t = tl.current
    if (!t || done.current) return
    t.timeScale(6)
  }

  return (
    <div
      ref={root}
      onClick={skip}
      style={{ opacity: 0 }}
      className="fixed inset-0 z-10 flex cursor-default select-none flex-col items-center justify-center px-8 text-center"
    >
      <p data-date className="font-display text-[3.4rem] leading-none text-ink sm:text-7xl">
        {formatDayMonth(date)}
      </p>
      <p
        data-phrase
        style={{ opacity: 0 }}
        className="absolute inset-x-8 top-1/2 -translate-y-1/2 font-display text-[2.7rem] italic leading-[1.2] text-balance sm:text-6xl"
      >
        {phrase}
      </p>
      <p
        className={`label absolute bottom-[max(2rem,env(safe-area-inset-bottom))] transition-opacity duration-1000 ${hint ? 'opacity-100' : 'opacity-0'}`}
      >
        {copy.skipHint}
      </p>
    </div>
  )
}
