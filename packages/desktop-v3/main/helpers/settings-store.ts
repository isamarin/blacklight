import Store from 'electron-store'

export interface WebUISettings {
  webui_autostart: boolean
  webui_port: number
}

const defaults: WebUISettings = {
  webui_autostart: false,
  webui_port: 9003,
}

const store = new Store<{ webui: WebUISettings }>({
  name: 'greenlight-settings',
  defaults: { webui: defaults },
})

export function getWebUISettings(): WebUISettings {
  return { ...defaults, ...store.get('webui') }
}

export function setWebUISettings(settings: Partial<WebUISettings>): WebUISettings {
  const next = { ...getWebUISettings(), ...settings }
  store.set('webui', next)
  return next
}