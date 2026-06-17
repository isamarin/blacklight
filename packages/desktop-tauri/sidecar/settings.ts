import fs from 'fs'
import path from 'path'
import os from 'os'

export interface SidecarSettings {
  webui_autostart: boolean
  webui_port: number
}

const defaults: SidecarSettings = {
  webui_autostart: true,
  webui_port: 9003,
}

function settingsPath(): string {
  const base = process.env.BLACKLIGHT_DATA_DIR ?? path.join(os.homedir(), '.blacklight')
  fs.mkdirSync(base, { recursive: true })
  return path.join(base, 'sidecar-settings.json')
}

export function loadSidecarSettings(): SidecarSettings {
  try {
    const raw = fs.readFileSync(settingsPath(), 'utf8')
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return { ...defaults }
  }
}

export function saveSidecarSettings(patch: Partial<SidecarSettings>): SidecarSettings {
  const next = { ...loadSidecarSettings(), ...patch }
  fs.writeFileSync(settingsPath(), JSON.stringify(next, null, 2))
  return next
}