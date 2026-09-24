import path from 'node:path'
import { Readable } from 'node:stream'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// En développement, sert les fonctions de /api avec le même code qu'en production (Vercel).
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const m = url.pathname.match(/^\/api\/([a-z0-9/-]+)$/)
        if (!m) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.ts`)
          const handler = mod[req.method ?? 'GET']
          if (!handler) {
            res.statusCode = 405
            return res.end()
          }
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
          const request = new Request(url, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: hasBody ? (Readable.toWeb(req) as unknown as ReadableStream) : undefined,
            // @ts-expect-error requis par Node pour les corps en flux
            duplex: 'half',
          })
          const response: Response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => k !== 'set-cookie' && res.setHeader(k, v))
          const cookies = response.headers.getSetCookie()
          if (cookies.length) res.setHeader('set-cookie', cookies)
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (e) {
          server.config.logger.error(String(e))
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'server_error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [
      react(),
      devApi(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectRegister: null, // on enregistre le service worker nous-mêmes (voir src/lib/push.ts)
        manifest: {
          name: 'Nos jours',
          short_name: 'Nos jours',
          description: 'Un message par jour, rien que pour toi.',
          lang: 'fr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#e9d9b4',
          theme_color: '#e9d9b4',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,woff,woff2}'],
        },
        devOptions: { enabled: true, type: 'module' },
      }),
    ],
    resolve: { alias: { '@shared': path.resolve(process.cwd(), 'shared') } },
  }
})
