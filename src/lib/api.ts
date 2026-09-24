import type { DayResponse, Reply, StateResponse } from '@shared/types'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code)
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'same-origin', ...init })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'error')
  return data as T
}

export const api = {
  state: () => call<StateResponse>('/api/state'),
  day: (date: string) => call<DayResponse>(`/api/day?date=${date}`),
  reply: (date: string, text: string, photo?: string) =>
    call<{ reply: Reply }>('/api/reply', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ date, text, photo }),
    }),
  uploadPhoto: (date: string, file: File) => {
    const form = new FormData()
    form.set('date', date)
    form.set('file', file)
    return call<{ url: string }>('/api/upload', { method: 'POST', body: form })
  },
}
