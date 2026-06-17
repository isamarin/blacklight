export function isElectronApp(): boolean {
  return typeof window !== 'undefined' && 'trpcIpc' in window
}

export function isWebUIMode(): boolean {
  return typeof window !== 'undefined' && !('trpcIpc' in window)
}

export function getGreenlightBridge() {
  return typeof window !== 'undefined' ? window.greenlight : undefined
}