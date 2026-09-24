import { useCallback, useEffect, useState } from 'react'
import { isISODate } from '@shared/dates'

export type Route = { kind: 'home' } | { kind: 'history' } | { kind: 'day'; date: string } | { kind: 'admin' }

const parse = (): Route => {
  const h = location.hash.slice(1)
  if (h === 'nos-jours') return { kind: 'history' }
  if (h === 'admin') return { kind: 'admin' }
  if (isISODate(h)) return { kind: 'day', date: h }
  return { kind: 'home' }
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(parse)

  useEffect(() => {
    const on = () => setRoute(parse())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const go = useCallback((to: 'home' | 'history' | string) => {
    location.hash = to === 'home' ? '' : to === 'history' ? 'nos-jours' : to
  }, [])

  const back = useCallback(() => {
    if (history.length > 1) history.back()
    else location.hash = ''
  }, [])

  return { route, go, back }
}
