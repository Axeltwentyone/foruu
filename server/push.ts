import { promises as fs } from 'node:fs'
import path from 'node:path'
import webpush from 'web-push'

export interface PushSubscriptionData {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

function vapidReady(): boolean {
  // La clé publique est la même que celle exposée au navigateur (VITE_VAPID_PUBLIC_KEY) :
  // par nature une clé VAPID publique n'a rien de secret.
  const pub = process.env.VITE_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return false
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:no-reply@nos-jours.app', pub, priv)
  return true
}

// --- Upstash Redis (REST) : pour la prod ----------------------------------------
function upstashCmd(url: string, token: string) {
  return async (...args: string[]) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(args),
    })
    const body = (await res.json()) as { result?: unknown; error?: string }
    if (!res.ok || body.error) throw new Error(body.error ?? `Upstash ${res.status}`)
    return body.result
  }
}

function getUpstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  return url && token ? upstashCmd(url, token) : null
}

const SUB_KEY = 'push:subscriptions'
const FILE = path.join(process.cwd(), '.data', 'push.json')

interface FileShape {
  subs: Record<string, PushSubscriptionData>
  sent: Record<string, true>
}

async function readFile(): Promise<FileShape> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'))
  } catch {
    return { subs: {}, sent: {} }
  }
}
async function writeFile(data: FileShape) {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(data, null, 2))
}

export async function saveSubscription(sub: PushSubscriptionData): Promise<void> {
  const cmd = getUpstash()
  if (cmd) return void (await cmd('HSET', SUB_KEY, sub.endpoint, JSON.stringify(sub)))
  const data = await readFile()
  data.subs[sub.endpoint] = sub
  await writeFile(data)
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const cmd = getUpstash()
  if (cmd) return void (await cmd('HDEL', SUB_KEY, endpoint))
  const data = await readFile()
  delete data.subs[endpoint]
  await writeFile(data)
}

async function getAllSubscriptions(): Promise<PushSubscriptionData[]> {
  const cmd = getUpstash()
  if (cmd) {
    const flat = ((await cmd('HGETALL', SUB_KEY)) as string[]) ?? []
    const out: PushSubscriptionData[] = []
    for (let i = 1; i < flat.length; i += 2) out.push(JSON.parse(flat[i]))
    return out
  }
  return Object.values((await readFile()).subs)
}

/** true si c'est la première fois qu'on marque ce jour comme notifié (empêche les doublons). */
export async function markNotifiedOnce(date: string): Promise<boolean> {
  const cmd = getUpstash()
  if (cmd) {
    const result = await cmd('SET', `push:sent:${date}`, '1', 'NX', 'EX', '259200')
    return result === 'OK'
  }
  const data = await readFile()
  if (data.sent[date]) return false
  data.sent[date] = true
  await writeFile(data)
  return true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
}

/** Envoie la notification à tous les appareils abonnés ; retire ceux qui ne sont plus valides. */
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; pruned: number }> {
  if (!vapidReady()) throw new Error('vapid_not_configured')

  const subs = await getAllSubscriptions()
  let sent = 0
  let pruned = 0

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload))
        sent++
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await removeSubscription(sub.endpoint)
          pruned++
        } else {
          console.error('push failed', sub.endpoint, e)
        }
      }
    }),
  )

  return { sent, pruned }
}
