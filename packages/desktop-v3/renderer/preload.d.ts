import { IpcHandler, TrpcIpcHandler, GreenlightBridge } from '../main/preload'

declare global {
  interface Window {
    ipc: IpcHandler
    trpcIpc: TrpcIpcHandler
    greenlight?: GreenlightBridge
  }
}