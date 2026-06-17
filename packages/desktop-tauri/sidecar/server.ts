import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from '@greenlight/platform'
import { loadSidecarSettings, saveSidecarSettings } from './settings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const staticDir =
  process.env.GREENLIGHT_STATIC_DIR ??
  path.resolve(__dirname, '../../desktop-v3/app')

let httpServer: ReturnType<express.Express['listen']> | undefined
let running = false

function createApp(): express.Express {
  const app = express()
  app.use(express.json())

  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
    }),
  )

  app.get('/api/webui/status', (_req, res) => {
    res.json({ running })
  })

  app.get('/api/webui/settings', (_req, res) => {
    res.json(loadSidecarSettings())
  })

  app.post('/api/webui/settings', (req, res) => {
    res.json(saveSidecarSettings(req.body ?? {}))
  })

  app.post('/api/webui/start', (req, res) => {
    const port = Number(req.body?.port) || loadSidecarSettings().webui_port
    startServer(port)
    res.json({ running })
  })

  app.post('/api/webui/stop', (_req, res) => {
    stopServer()
    res.json({ running })
  })

  app.get('/health', (_req, res) => {
    res.json({ ok: true, running })
  })

  app.get('/', (_req, res) => {
    res.redirect('/home/')
  })

  app.use(express.static(staticDir))

  app.get('/{*path}', (req, res) => {
    const reqPath = req.path.endsWith('/') ? req.path.slice(0, -1) : req.path
    const htmlPath = path.join(staticDir, reqPath, 'index.html')
    res.sendFile(htmlPath, (err) => {
      if (err) {
        res.sendFile(path.join(staticDir, '404.html'), (err404) => {
          if (err404) {
            res.status(404).send('Not found')
          }
        })
      }
    })
  })

  return app
}

function startServer(port?: number): void {
  if (running) return

  const settings = loadSidecarSettings()
  const listenPort = port ?? settings.webui_port ?? 9003
  const app = createApp()

  httpServer = app.listen(listenPort, '127.0.0.1', () => {
    console.log(`[greenlight-sidecar] http://127.0.0.1:${listenPort}`)
    console.log(`[greenlight-sidecar] static: ${staticDir}`)
  })

  running = true
}

function stopServer(): void {
  if (!httpServer) return
  httpServer.close()
  httpServer = undefined
  running = false
  console.log('[greenlight-sidecar] stopped')
}

const settings = loadSidecarSettings()
const cliPort = process.env.GREENLIGHT_PORT ? Number(process.env.GREENLIGHT_PORT) : undefined

if (settings.webui_autostart || cliPort) {
  startServer(cliPort ?? settings.webui_port)
} else {
  console.log('[greenlight-sidecar] waiting for /api/webui/start (autostart disabled)')
}

process.on('SIGINT', () => {
  stopServer()
  process.exit(0)
})

process.on('SIGTERM', () => {
  stopServer()
  process.exit(0)
})