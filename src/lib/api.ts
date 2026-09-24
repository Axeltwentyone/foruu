import { upload } from '@vercel/blob/client'
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
  uploadPhoto: async (date: string, file: File) => {
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const name = `replies/${date}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    const blob = await upload(name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      contentType: file.type,
      clientPayload: JSON.stringify({ date }),
    })
    return blob.url
  },
}
