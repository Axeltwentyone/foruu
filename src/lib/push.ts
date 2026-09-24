const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

const urlBase64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64Safe)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

export const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true

export const pushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!VAPID_PUBLIC_KEY

/** Pour comprendre pourquoi pushSupported() est faux (diagnostic, jamais affiché tel quel). */
export function unsupportedReason(): string {
  if (!('serviceWorker' in navigator)) return 'serviceWorker manquant'
  if (!('PushManager' in window)) return 'PushManager manquant'
  if (!('Notification' in window)) return 'Notification manquant'
  if (!VAPID_PUBLIC_KEY) return 'clé VAPID absente du build'
  return 'inconnu'
}

/** Enregistre le service worker (à appeler une fois, au chargement). N'échoue jamais bruyamment. */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  try {
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({ immediate: true })
  } catch (e) {
    console.error('service worker registration failed', e)
  }
}

export type SubscribeResult = 'subscribed' | 'denied' | 'unsupported' | 'error'

export async function subscribeToPush(): Promise<SubscribeResult> {
  if (!pushSupported()) return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'

  try {
    const registration = await navigator.serviceWorker.ready
    const existing = await registration.pushManager.getSubscription()
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
      }))

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    })
    return 'subscribed'
  } catch (e) {
    console.error('push subscribe failed', e)
    return 'error'
  }
}

export async function currentSubscription() {
  if (!pushSupported()) return null
  const registration = await navigator.serviceWorker.ready.catch(() => null)
  return (await registration?.pushManager.getSubscription()) ?? null
}
