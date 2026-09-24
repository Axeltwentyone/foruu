import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE = 'admin_sid'
const MAX_AGE = 60 * 60 * 24 * 90 // ~90 jours

const env = (name: string) => {
  const v = process.env[name]
  if (!v) throw new Error(`Variable d'environnement manquante : ${name}`)
  return v
}

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const sha = (s: string) => createHash('sha256').update(s).digest()

export function adminPasswordMatches(input: string): boolean {
  const expected = normalize(env('ADMIN_PASSWORD'))
  return timingSafeEqual(sha(normalize(input)), sha(expected))
}

const sign = (payload: string) => createHmac('sha256', env('ADMIN_SESSION_SECRET')).update(payload).digest('base64url')

export function adminSessionCookie(): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE
  const payload = `v1.${exp}`
  const secure = process.env.VERCEL ? '; Secure' : ''
  return `${COOKIE}=${payload}.${sign(payload)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Lax${secure}`
}

export function isAdminAuthed(req: Request): boolean {
  const raw = req.headers.get('cookie') ?? ''
  const match = raw.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))
  if (!match) return false
  const [v, exp, sig] = match.slice(COOKIE.length + 1).split('.')
  if (v !== 'v1' || !exp || !sig) return false
  if (Number(exp) < Date.now() / 1000) return false
  const a = Buffer.from(sig)
  const b = Buffer.from(sign(`v1.${exp}`))
  return a.length === b.length && timingSafeEqual(a, b)
}

// Freinage basique des essais de mot de passe (par instance, suffisant ici).
const fails = new Map<string, { n: number; until: number }>()
export function adminLoginBlocked(ip: string): boolean {
  const f = fails.get(ip)
  return !!f && f.n >= 8 && Date.now() < f.until
}
export function noteAdminLogin(ip: string, ok: boolean) {
  if (ok) return void fails.delete(ip)
  const f = fails.get(ip)
  fails.set(ip, { n: (f?.n ?? 0) + 1, until: Date.now() + 10 * 60_000 })
}
