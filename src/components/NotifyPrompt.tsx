import { useEffect, useState } from 'react'
import { copy } from '@shared/copy'
import { currentSubscription, isIOS, isStandalone, pushSupported, subscribeToPush, unsupportedReason } from '../lib/push'

type State = 'checking' | 'hidden' | 'ios-hint' | 'ios-unsupported' | 'ask' | 'denied' | 'on' | 'asking' | 'error'

export default function NotifyPrompt() {
  const [state, setState] = useState<State>('checking')

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!pushSupported()) {
        if (isIOS() && !isStandalone()) return setState('ios-hint')
        if (isIOS()) {
          console.error('notifications indisponibles :', unsupportedReason())
          return setState('ios-unsupported')
        }
        return setState('hidden')
      }
      if (Notification.permission === 'denied') return setState('denied')
      const sub = await currentSubscription()
      if (!alive) return
      setState(sub ? 'on' : 'ask')
    })()
    return () => {
      alive = false
    }
  }, [])

  const ask = async () => {
    setState('asking')
    const result = await subscribeToPush()
    setState(result === 'subscribed' ? 'on' : result === 'denied' ? 'denied' : 'error')
  }

  if (state === 'checking' || state === 'hidden') return null

  if (state === 'ios-hint') return <p className="label mt-3 max-w-[22rem] !leading-relaxed">{copy.notify.iosHint}</p>
  if (state === 'ios-unsupported')
    return <p className="label mt-3 max-w-[22rem] !leading-relaxed">{copy.notify.iosUnsupported}</p>
  if (state === 'denied') return <p className="label mt-3 max-w-[22rem] !leading-relaxed">{copy.notify.denied}</p>
  if (state === 'on') return <p className="label mt-3">{copy.notify.on}</p>
  if (state === 'error') return <p className="label mt-3 !text-accent">{copy.notify.error}</p>

  return (
    <button type="button" className="quiet-button mt-3 !py-0" disabled={state === 'asking'} onClick={ask}>
      {copy.notify.ask}
    </button>
  )
}
