import path from 'path'
import express from 'express'
import proxy from 'express-http-proxy'
import { ipcMain, shell } from 'electron'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from '@greenlight/platform'
import type { Server } from 'http'
import { getWebUISettings, setWebUISettings } from './helpers/settings-store'

export class WebUIServer {
  private server?: Server
  private _running = false

  isRunning(): boolean {
    return this._running
  }

  start(options: { isProd: boolean; devPort?: string; port?: number }): void {
    if (this._running) return

    const settings = getWebUISettings()
    const port = options.port ?? settings.webui_port ?? 9003
    const app = express()

    app.use(
      '/trpc',
      createExpressMiddleware({
        router: appRouter,
        createContext: () => ({}),
      }),
    )

    app.get('/', (_req, res) => {
      res.redirect('/home/')
    })

    if (options.isProd) {
      const staticDir = path.join(import.meta.dirname, '../app')
      app.use(express.static(staticDir))

      app.get('/{*path}', (req, res) => {
        const reqPath = req.path.endsWith('/') ? req.path.slice(0, -1) : req.path
        const htmlPath = path.join(staticDir, reqPath, 'index.html')
        res.sendFile(htmlPath, (err) => {
          if (err) {
            res.sendFile(path.join(staticDir, '404.html'))
          }
        })
      })
    } else {
      const targetPort = options.devPort || '8888'
      app.use(proxy(`localhost:${targetPort}`))
    }

    this.server = app.listen(port, '127.0.0.1', () => {
      console.log(`[WebUI] Server running at http://127.0.0.1:${port}`)
    })

    this._running = true
  }

  stop(): void {
    if (!this.server) return
    this.server.close()
    this.server = undefined
    this._running = false
    console.log('[WebUI] Server stopped')
  }
}

export const webUIServer = new WebUIServer()

export function setupWebUIHandlers(isProd: boolean, devPort?: string): void {
  ipcMain.handle('webui:getStatus', () => webUIServer.isRunning())

  ipcMain.handle('webui:start', (_event, port?: number) => {
    webUIServer.start({ isProd, devPort, port })
    return webUIServer.isRunning()
  })

  ipcMain.handle('webui:stop', () => {
    webUIServer.stop()
    return webUIServer.isRunning()
  })

  ipcMain.handle(
    'webui:saveSettings',
    (_event, settings: { webui_autostart?: boolean; webui_port?: number }) => {
      return setWebUISettings(settings)
    },
  )

  ipcMain.handle('webui:getSettings', () => getWebUISettings())

  ipcMain.handle('shell:openExternal', (_event, url: string) => {
    return shell.openExternal(url)
  })
}

export function maybeAutostartWebUI(isProd: boolean, devPort?: string): void {
  const settings = getWebUISettings()
  if (settings.webui_autostart) {
    webUIServer.start({ isProd, devPort, port: settings.webui_port })
  }
}