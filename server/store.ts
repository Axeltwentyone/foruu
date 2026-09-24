import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Reply } from '../shared/types.js'

export interface Store {
  getAll(): Promise<Record<string, Reply>>
  get(date: string): Promise<Reply | null>
  set(date: string, text: string, photo?: string): Promise<Reply>
}

const upsert = (prev: Reply | null | undefined, text: string, photo?: string): Reply => {
  const now = new Date().toISOString()
  const reply: Reply = { text, createdAt: prev?.createdAt ?? now, updatedAt: now }
  if (photo) reply.photo = photo
  return reply
}

// --- Upstash Redis (REST) : pour la prod sur Vercel ---------------------------
function upstash(url: string, token: string): Store {
  const cmd = async (...args: string[]) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(args),
    })
    const body = (await res.json()) as { result?: unknown; error?: string }
    if (!res.ok || body.error) throw new Error(body.error ?? `Upstash ${res.status}`)
    return body.result
  }
  const KEY = 'replies'
  return {
    async getAll() {
      const flat = ((await cmd('HGETALL', KEY)) as string[]) ?? []
      const out: Record<string, Reply> = {}
      for (let i = 0; i < flat.length; i += 2) out[flat[i]] = JSON.parse(flat[i + 1])
      return out
    },
    async get(date) {
      const raw = (await cmd('HGET', KEY, date)) as string | null
      return raw ? (JSON.parse(raw) as Reply) : null
    },
    async set(date, text, photo) {
      const reply = upsert(await this.get(date), text, photo)
      await cmd('HSET', KEY, date, JSON.stringify(reply))
      return reply
    },
  }
}

// --- Fichier local : pour le développement --------------------------------------
function file(): Store {
  const FILE = path.join(process.cwd(), '.data', 'replies.json')
  const read = async (): Promise<Record<string, Reply>> => {
    try {
      return JSON.parse(await fs.readFile(FILE, 'utf8'))
    } catch {
      return {}
    }
  }
  return {
    getAll: read,
    async get(date) {
      return (await read())[date] ?? null
    },
    async set(date, text, photo) {
      const all = await read()
      all[date] = upsert(all[date], text, photo)
      await fs.mkdir(path.dirname(FILE), { recursive: true })
      await fs.writeFile(FILE, JSON.stringify(all, null, 2))
      return all[date]
    },
  }
}

export function getStore(): Store {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (url && token) return upstash(url, token)
  if (process.env.VERCEL) throw new Error('STORE_NOT_CONFIGURED')
  return file()
}
