import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers/create-window'
import { setupTrpcHandler } from './trpc-handler'
import { setupWebUIHandlers, maybeAutostartWebUI } from './webui'

const isProd = process.env.NODE_ENV === 'production'
const devPort = process.argv[2]

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
  setupTrpcHandler()
  setupWebUIHandlers(isProd, devPort)
  await app.whenReady()

  maybeAutostartWebUI(isProd, devPort)

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    await mainWindow.loadURL(`http://localhost:${devPort}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})