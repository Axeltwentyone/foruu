import { days } from '../../content/days.js'
import { getPhase, getToday } from '../../server/clock.js'
import { json } from '../../server/http.js'
import { markNotifiedOnce, sendPushToAll } from '../../server/push.js'

// Déclenché une fois par jour par Vercel Cron (voir vercel.json).
// Protégé par CRON_SECRET : Vercel l'envoie automatiquement en en-tête
// Authorization quand le cron est configuré avec cette variable définie.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return json({ error: 'unauthorized' }, 401)
  }

  const today = getToday()
  if (getPhase(today) !== 'running') return json({ skipped: 'not_running' })
  if (!days.some((d) => d.date === today)) return json({ skipped: 'no_content' })

  const firstRun = await markNotifiedOnce(today)
  if (!firstRun) return json({ skipped: 'already_sent' })

  try {
    const result = await sendPushToAll({
      title: 'Nos jours',
      body: 'Il y a quelque chose pour toi aujourd’hui.',
      url: '/',
    })
    return json({ ok: true, ...result })
  } catch (e) {
    console.error('cron notify failed', e)
    return json({ error: 'send_failed' }, 500)
  }
}
