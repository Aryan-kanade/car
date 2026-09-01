import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.js'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
  plugins: [
    // NOTE: React Compiler (oxc-plugin-react-compiler@0.2.0) was trialed here and
    // reverted — its output trips rolldown PARSE_ERRORs on this codebase
    // (duplicate `_temp` declarations). Retry on a later plugin release.
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'og-image.png'],
      manifest: {
        name: 'KMKIRAMYKI Advanced Chemistry',
        short_name: 'KMKIRAMYKI',
        description:
          'Professional-grade detailing chemistry for enthusiasts who obsess over the details.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    watch: {
      // Polling avoids missed/reordered file-change events on Windows,
      // which previously served stale mixed module transforms (blank page).
      usePolling: true,
    },
  },
  // Mount the /api serverless functions locally in dev — no Vercel CLI needed.
  // Handlers are (req, res), loaded through Vite so their src/ TS imports work.
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/')) return next()
      const route = req.url.slice(4).split('?')[0].replace(/\/+$/, '')
      if (route.includes('/_lib') || route.includes('..')) return next()
      try {
        const loaded = await server.ssrLoadModule(`/api/${route.replace(/^\//, '')}.js`)
        const handler = loaded.default
        if (typeof handler !== 'function') throw new Error('No handler exported.')
        handler(req, res)
      } catch (err) {
        res.statusCode = err?.message === 'No handler exported.' ? 404 : 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: `Dev API error: ${err?.message ?? 'unknown'}` }))
      }
    })
  },
})
