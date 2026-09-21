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
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'error')
  return data as T
}

export const api = {
  state: () => call<StateResponse>('/api/state'),
  day: (date: string) => call<DayResponse>(`/api/day?date=${date}`),
  reply: (date: string, text: string) =>
    call<{ reply: Reply }>('/api/reply', { method: 'POST', body: JSON.stringify({ date, text }) }),
}
