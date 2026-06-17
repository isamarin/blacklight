import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send<T>(channel: string, value?: T) {
    ipcRenderer.send(channel, value)
  },
  on<T>(channel: string, callback: (...args: T[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: T[]) => callback(...args)
    ipcRenderer.on(channel, subscription)
    return () => ipcRenderer.removeListener(channel, subscription)
  },
}

const trpcIpcHandler = {
  invoke(op: { path: string; type: string; input: unknown }) {
    return ipcRenderer.invoke('trpc', op)
  },
}

const webuiHandler = {
  getStatus() {
    return ipcRenderer.invoke('webui:getStatus') as Promise<boolean>
  },
  start(port?: number) {
    return ipcRenderer.invoke('webui:start', port) as Promise<boolean>
  },
  stop() {
    return ipcRenderer.invoke('webui:stop') as Promise<boolean>
  },
  saveSettings(settings: { webui_autostart?: boolean; webui_port?: number }) {
    return ipcRenderer.invoke('webui:saveSettings', settings)
  },
  getSettings() {
    return ipcRenderer.invoke('webui:getSettings') as Promise<{
      webui_autostart: boolean
      webui_port: number
    }>
  },
}

const shellHandler = {
  openExternal(url: string) {
    return ipcRenderer.invoke('shell:openExternal', url)
  },
}

contextBridge.exposeInMainWorld('ipc', handler)
contextBridge.exposeInMainWorld('trpcIpc', trpcIpcHandler)
contextBridge.exposeInMainWorld('greenlight', {
  webui: webuiHandler,
  shell: shellHandler,
  isElectron: true,
})

export type IpcHandler = typeof handler
export type TrpcIpcHandler = typeof trpcIpcHandler
export type GreenlightBridge = {
  webui: typeof webuiHandler
  shell: typeof shellHandler
  isElectron: true
}