// Petites mémoires locales (jamais essentielles : tout doit marcher sans).

const safe = <T,>(fn: () => T, fallback: T): T => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const hasSeen = (date: string) => safe(() => localStorage.getItem(`seen:${date}`) === '1', false)
export const markSeen = (date: string) => safe(() => localStorage.setItem(`seen:${date}`, '1'), undefined)

export const getDraft = (date: string) => safe(() => localStorage.getItem(`draft:${date}`) ?? '', '')
export const setDraft = (date: string, text: string) =>
  safe(
    () => (text ? localStorage.setItem(`draft:${date}`, text) : localStorage.removeItem(`draft:${date}`)),
    undefined,
  )
