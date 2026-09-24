import { useCallback, useEffect, useState } from 'react'
import { CONFIG } from '@shared/config'
import { copy } from '@shared/copy'
import { formatDayMonth } from '@shared/dates'
import type { StateResponse } from '@shared/types'
import DayView from './components/DayView'
import History from './components/History'
import { api } from './lib/api'
import { registerServiceWorker } from './lib/push'
import { useRoute } from './lib/useRoute'

type Boot = { s: 'loading' } | { s: 'error' } | { s: 'ready'; state: StateResponse }

export default function App() {
  const [boot, setBoot] = useState<Boot>({ s: 'loading' })
  const { route, go, back } = useRoute()

  const refresh = useCallback(async () => {
    try {
      const state = await api.state()
      setBoot((prev) => {
        // Le jour a changé pendant que l'onglet restait ouvert : on repart de zéro.
        if (prev.s === 'ready' && prev.state.today !== state.today) location.hash = ''
        return { s: 'ready', state }
      })
    } catch {
      setBoot({ s: 'error' })
    }
  }, [])

  useEffect(() => {
    void refresh()
    void registerServiceWorker()
    const onVisible = () => document.visibilityState === 'visible' && void refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  if (boot.s === 'loading') return <div className="min-h-[100dvh]" />
  if (boot.s === 'error') {
    return (
      <Screen>
        <p className="font-display text-4xl italic">Pas de réseau ?</p>
        <button className="quiet-button mt-8" onClick={() => void refresh()}>
          Réessayer
        </button>
      </Screen>
    )
  }

  const { state } = boot

  if (route.kind === 'history' && state.phase !== 'before') {
    return <History state={state} onOpen={go} onClose={back} />
  }

  if (state.phase === 'before') {
    return (
      <Screen>
        <p className="label mb-8">{CONFIG.sender}</p>
        <p className="text-balance font-display text-5xl italic leading-[1.1]">
          {copy.before(formatDayMonth(CONFIG.start))}
        </p>
      </Screen>
    )
  }

  if (state.phase === 'ended' && route.kind !== 'day') {
    return (
      <Screen>
        <p className="text-balance font-display text-5xl italic leading-[1.1]">{copy.ended.title}</p>
        <p className="mt-8 max-w-sm text-pretty font-serif text-xl leading-relaxed text-mute">{copy.ended.body}</p>
        <button className="quiet-button mt-10 self-start" onClick={() => go('history')}>
          {copy.history}
        </button>
      </Screen>
    )
  }

  const date = route.kind === 'day' ? route.date : state.today

  return (
    <DayView
      key={date}
      date={date}
      today={state.today}
      daysLeft={state.daysLeft}
      onHistory={() => go('history')}
      onReplied={() => void refresh()}
    />
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="rise mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-8 pb-24">{children}</div>
}
