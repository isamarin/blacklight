const DEFAULT_API_PORT = 9003

function getApiPort(): number {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_API_PORT
  }
  return Number(localStorage.getItem('greenlight-api-port')) || DEFAULT_API_PORT
}

export function getApiOrigin(): string {
  return `http://127.0.0.1:${getApiPort()}`
}

export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function isElectronApp(): boolean {
  return typeof window !== 'undefined' && 'trpcIpc' in window
}

/** Browser tab pointed at the local WebUI server (not the desktop shell). */
export function isWebUIMode(): boolean {
  return typeof window !== 'undefined' && !isElectronApp() && !isTauriApp()
}

export function isDesktopShell(): boolean {
  return isElectronApp() || isTauriApp()
}

export function getTrpcHttpUrl(): string {
  if (typeof window === 'undefined') {
    return '/trpc'
  }

  if (isDesktopShell()) {
    return `${getApiOrigin()}/trpc`
  }

  return '/trpc'
}

export function getGreenlightBridge() {
  return typeof window !== 'undefined' ? window.greenlight : undefined
}

export async function openExternal(url: string): Promise<void> {
  if (isTauriApp()) {
    const { openUrl } = await import('@tauri-apps/plugin-opener')
    await openUrl(url)
    return
  }

  const bridge = getGreenlightBridge()
  if (bridge?.shell?.openExternal) {
    await bridge.shell.openExternal(url)
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

async function sidecarFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiOrigin()}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    throw new Error(`Sidecar ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const tauriSidecar = {
  getStatus(): Promise<boolean> {
    return sidecarFetch<{ running: boolean }>('/api/webui/status').then((r) => r.running)
  },
  start(port?: number): Promise<boolean> {
    return sidecarFetch<{ running: boolean }>('/api/webui/start', {
      method: 'POST',
      body: JSON.stringify({ port }),
    }).then((r) => r.running)
  },
  stop(): Promise<boolean> {
    return sidecarFetch<{ running: boolean }>('/api/webui/stop', { method: 'POST' }).then(
      (r) => r.running,
    )
  },
  getSettings(): Promise<{ webui_autostart: boolean; webui_port: number }> {
    return sidecarFetch('/api/webui/settings')
  },
  saveSettings(settings: { webui_autostart?: boolean; webui_port?: number }) {
    return sidecarFetch('/api/webui/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    })
  },
}

export function getWebuiApi() {
  const bridge = getGreenlightBridge()
  if (bridge?.webui) {
    return bridge.webui
  }
  if (isTauriApp() || isWebUIMode()) {
    return tauriSidecar
  }
  return undefined
}