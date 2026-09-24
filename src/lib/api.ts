import type { AdminReplyItem, DayResponse, Reply, StateResponse } from '@shared/types'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code)
  }
}

const TIMEOUT_MS = 25_000

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(path, { credentials: 'same-origin', signal: controller.signal, ...init })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new ApiError(res.status, data.error ?? 'error')
    return data as T
  } finally {
    clearTimeout(timeout)
  }
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
  uploadPhoto: async (date: string, file: File) => {
    const form = new FormData()
    form.set('date', date)
    form.set('file', file)
    const { url } = await call<{ url: string }>('/api/upload', { method: 'POST', body: form })
    return url
  },
  adminLogin: (password: string) =>
    call<{ ok: true }>('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    }),
  adminReplies: () => call<{ items: AdminReplyItem[] }>('/api/admin/replies'),
}
