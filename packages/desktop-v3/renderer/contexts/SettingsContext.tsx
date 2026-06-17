import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { defaultSettings, type AppSettings } from './settings.defaults'

interface SettingsContextType {
  settings: AppSettings
  setSettings: (settings: AppSettings) => void
}

const STORAGE_KEY = 'greenlight-settings'

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setSettingsState({ ...defaultSettings, ...JSON.parse(saved) })
      }
    } catch (e) {
      console.error('Failed to load settings', e)
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings, loaded])

  const setSettings = (next: AppSettings) => setSettingsState(next)

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}