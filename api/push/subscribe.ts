import { json, readJson } from '../../server/http.js'
import { removeSubscription, saveSubscription, type PushSubscriptionData } from '../../server/push.js'

const isSubscription = (v: unknown): v is PushSubscriptionData =>
  !!v &&
  typeof v === 'object' &&
  typeof (v as PushSubscriptionData).endpoint === 'string' &&
  typeof (v as PushSubscriptionData).keys?.p256dh === 'string' &&
  typeof (v as PushSubscriptionData).keys?.auth === 'string'

export async function POST(req: Request) {
  const body = await readJson<{ subscription?: unknown }>(req)
  if (!isSubscription(body?.subscription)) return json({ error: 'bad_subscription' }, 400)

  try {
    await saveSubscription(body.subscription)
    return json({ ok: true })
  } catch (e) {
    console.error('save subscription failed', e)
    return json({ error: 'store_unavailable' }, 503)
  }
}

export async function DELETE(req: Request) {
  const body = await readJson<{ endpoint?: string }>(req)
  if (typeof body?.endpoint !== 'string') return json({ error: 'bad_request' }, 400)

  try {
    await removeSubscription(body.endpoint)
    return json({ ok: true })
  } catch (e) {
    console.error('remove subscription failed', e)
    return json({ error: 'store_unavailable' }, 503)
  }
}
