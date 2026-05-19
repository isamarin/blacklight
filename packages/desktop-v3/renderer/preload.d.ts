import { IpcHandler, TrpcIpcHandler } from '../main/preload'

declare global {
  interface Window {
    ipc: IpcHandler
    trpcIpc: TrpcIpcHandler
  }
}
