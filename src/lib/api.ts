import { upload } from '@vercel/blob/client'
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
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const name = `replies/${date}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const blob = await upload(name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: file.type,
        clientPayload: JSON.stringify({ date }),
        abortSignal: controller.signal,
      })
      return blob.url
    } finally {
      clearTimeout(timeout)
    }
  },
  adminLogin: (password: string) =>
    call<{ ok: true }>('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    }),
  adminReplies: () => call<{ items: AdminReplyItem[] }>('/api/admin/replies'),
}
