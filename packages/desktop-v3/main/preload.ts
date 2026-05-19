import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send<T>(channel: string, value?: T) {
    ipcRenderer.send(channel, value)
  },
  on<T>(channel: string, callback: (...args: T[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: T[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
}

const trpcIpcHandler = {
  invoke(op: { path: string; type: string; input: unknown }) {
    return ipcRenderer.invoke('trpc', op)
  },
}

contextBridge.exposeInMainWorld('ipc', handler)
contextBridge.exposeInMainWorld('trpcIpc', trpcIpcHandler)

export type IpcHandler = typeof handler
export type TrpcIpcHandler = typeof trpcIpcHandler
