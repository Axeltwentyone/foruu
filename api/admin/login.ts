import { adminLoginBlocked, adminPasswordMatches, adminSessionCookie, noteAdminLogin } from '../../server/adminAuth.js'
import { json, readJson } from '../../server/http.js'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  if (adminLoginBlocked(ip)) return json({ error: 'too_many_attempts' }, 429)

  const body = await readJson<{ password?: string }>(req)
  const ok = typeof body?.password === 'string' && adminPasswordMatches(body.password)
  noteAdminLogin(ip, ok)
  if (!ok) return json({ error: 'wrong' }, 401)

  return json({ ok: true }, 200, { 'set-cookie': adminSessionCookie() })
}
