import { useCallback, useEffect, useState } from 'react'
import { CONFIG, INTROS } from '@shared/config'
import { copy } from '@shared/copy'
import { daysBetween, formatLong } from '@shared/dates'
import type { DayResponse } from '@shared/types'
import { api, ApiError } from '../lib/api'
import { hasSeen, markSeen } from '../lib/storage'
import Intro from './Intro'
import Message from './Message'
import Reply from './Reply'

interface Props {
  date: string
  today: string
  daysLeft: number
  onHistory: () => void
  onReplied: () => void
}

type Load = { s: 'loading' } | { s: 'ready'; data: DayResponse } | { s: 'locked' } | { s: 'error' }

export default function DayView({ date, today, daysLeft, onHistory, onReplied }: Props) {
  const isToday = date === today
  // L'ouverture complète n'a lieu qu'à la première visite du jour.
  const [firstVisit] = useState(() => isToday && !hasSeen(date))
  const [stage, setStage] = useState<'intro' | 'message'>(firstVisit ? 'intro' : 'message')
  const [revealed, setRevealed] = useState(false)
  const [load, setLoad] = useState<Load>({ s: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setLoad({ s: 'loading' })
    api
      .day(date)
      .then((data) => alive && setLoad({ s: 'ready', data }))
      .catch((e) => {
        if (!alive) return
        setLoad(e instanceof ApiError && e.status === 403 ? { s: 'locked' } : { s: 'error' })
      })
    return () => {
      alive = false
    }
  }, [date, attempt])

  const introDone = useCallback(() => {
    markSeen(date)
    setStage('message')
  }, [date])
  const messageDone = useCallback(() => {
    setRevealed(true)
    markSeen(date)
  }, [date])

  if (load.s === 'loading') return <div className="min-h-[100dvh]" />

  if (load.s !== 'ready') {
    return (
      <Centered>
        <p className="font-display text-4xl italic">{load.s === 'locked' ? copy.locked : 'Impossible de charger.'}</p>
        <div className="mt-8 flex gap-6">
          {load.s === 'error' && (
            <button className="quiet-button" onClick={() => setAttempt((n) => n + 1)}>
              Réessayer
            </button>
          )}
          <button className="quiet-button" onClick={onHistory}>
            {copy.history}
          </button>
        </div>
      </Centered>
    )
  }

  const { entry, reply } = load.data
  const phrase = entry?.intro ?? INTROS[daysBetween(CONFIG.start, date) % INTROS.length]

  if (stage === 'intro') return <Intro date={date} phrase={phrase} onDone={introDone} />

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[34rem] px-7 pb-[max(6rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))]">
      <header className="rise flex items-center justify-between" style={{ animationDelay: '0.3s' }}>
        <button className="quiet-button -ml-1" onClick={onHistory}>
          {copy.history}
        </button>
        <span className="label !text-[1.5rem]">{formatLong(date)}</span>
      </header>

      <main className="mt-16 sm:mt-24">
        {entry ? (
          <Message key={date} entry={entry} pace={firstVisit ? 'slow' : 'fast'} onDone={messageDone} />
        ) : (
          <EmptyDay onDone={messageDone} />
        )}

        {revealed && (
          <div className="rise mt-20">
            <Reply
              date={date}
              initial={reply}
              prompt={entry?.replyPrompt ?? (isToday ? copy.replyPrompt : copy.replyPromptPast)}
              onSaved={onReplied}
            />
          </div>
        )}
      </main>

      {revealed && (
        <footer className="rise mt-24" style={{ animationDelay: '0.6s' }}>
          <p className="label">{copy.counter(daysLeft)}</p>
        </footer>
      )}
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-8 pb-24">{children}</div>
}

function EmptyDay({ onDone }: { onDone: () => void }) {
  useEffect(onDone, [onDone])
  return <p className="rise font-display text-4xl italic text-mute">{copy.emptyDay}</p>
}
