/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.skipWaiting()
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

interface PushPayload {
  title: string
  body: string
  url?: string
}

self.addEventListener('push', (event) => {
  let data: PushPayload = { title: 'Nos jours', body: 'Il y a quelque chose pour toi aujourd’hui.' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    // payload non-JSON : on garde le texte par défaut
  }

  const options: NotificationOptions & { renotify?: boolean } = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url ?? '/' },
    tag: 'nos-jours', // une seule notification visible à la fois
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data?.url as string) ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => 'focus' in c)
      if (existing) return (existing as WindowClient).focus()
      return self.clients.openWindow(url)
    }),
  )
})
