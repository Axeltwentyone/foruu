import { Fragment, useEffect, useRef } from 'react'
import { copy } from '@shared/copy'
import { formatMonth, formatShort } from '@shared/dates'
import type { StateResponse } from '@shared/types'
import { hasSeen } from '../lib/storage'

interface Props {
  state: StateResponse
  onOpen: (date: string) => void
  onClose: () => void
}

export default function History({ state, onOpen, onClose }: Props) {
  const todayRow = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    todayRow.current?.scrollIntoView({ block: 'center' })
  }, [])

  let lastMonth = ''

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[34rem] px-7 pb-[max(6rem,env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-10 -mx-7 flex items-end justify-between bg-paper/80 px-7 pb-5 pt-[max(1.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <h1 className="font-display text-[3rem] italic leading-none">{copy.history}</h1>
        <button className="quiet-button -mr-1" onClick={onClose}>
          Fermer
        </button>
      </header>

      <ol className="mt-4 rise">
        {state.days.map(({ date, hasReply }) => {
          const month = date.slice(0, 7)
          const showMonth = month !== lastMonth
          lastMonth = month

          const isToday = date === state.today
          const unlocked = date <= state.today && state.phase !== 'before'
          const label = formatShort(date)

          return (
            <Fragment key={date}>
              {showMonth && <li className="label mb-1 mt-12 first:mt-6">{formatMonth(date)}</li>}
              <li>
                <button
                  ref={isToday ? todayRow : undefined}
                  disabled={!unlocked}
                  onClick={() => onOpen(date)}
                  aria-label={unlocked ? label : `${label}, ${copy.locked}`}
                  className={`group grid w-full grid-cols-[6.5rem_1fr_auto] items-baseline gap-3 border-b border-rule/70 py-[0.95rem] text-left transition-colors disabled:cursor-default ${
                    unlocked ? 'hover:border-accent' : 'opacity-40'
                  }`}
                >
                  <span className={`font-body text-[1.6rem] leading-none ${isToday ? 'text-accent' : ''}`}>{label}</span>
                  <span className="label">{unlocked && hasReply ? 'répondu' : ''}</span>
                  <span className="font-body text-[1.5rem] leading-none">
                    {isToday ? (
                      <span className="text-accent">→ {copy.historyToday}</span>
                    ) : unlocked ? (
                      hasSeen(date) ? (
                        <span aria-label="lu">✓</span>
                      ) : (
                        <span className="text-mute" aria-label="pas encore lu">
                          ○
                        </span>
                      )
                    ) : (
                      <Lock />
                    )}
                  </span>
                </button>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </div>
  )
}

const Lock = () => (
  <svg width="11" height="13" viewBox="0 0 11 13" fill="none" stroke="currentColor" strokeWidth="1.1" className="text-mute" aria-hidden>
    <rect x="1" y="5.5" width="9" height="6.5" rx="1" />
    <path d="M3 5.5V3.6a2.5 2.5 0 0 1 5 0v1.9" />
  </svg>
)
