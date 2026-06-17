import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import SettingsSidebar from '../../components/settings/SettingsSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useSettings } from '../../contexts/SettingsContext'
import { getGreenlightBridge, isWebUIMode } from '../../utils/electron'

export default function SettingsWebUIPage() {
  const { t } = useTranslation()
  const { settings, setSettings } = useSettings()
  const [running, setRunning] = useState(false)
  const inWebUI = isWebUIMode()

  useEffect(() => {
    const bridge = getGreenlightBridge()
    if (!bridge) return

    const refresh = () => bridge.webui.getStatus().then(setRunning)
    refresh()
    const interval = setInterval(refresh, 1000)
    return () => clearInterval(interval)
  }, [])

  const syncToMain = (next: typeof settings) => {
    getGreenlightBridge()?.webui.saveSettings({
      webui_autostart: next.webui_autostart,
      webui_port: Number(next.webui_port) || 9003,
    })
  }

  const toggleServer = async () => {
    const bridge = getGreenlightBridge()
    if (!bridge) return
    if (running) {
      await bridge.webui.stop()
    } else {
      await bridge.webui.start(Number(settings.webui_port) || 9003)
    }
    setRunning(await bridge.webui.getStatus())
  }

  const openInBrowser = () => {
    const port = Number(settings.webui_port) || 9003
    getGreenlightBridge()?.shell.openExternal(`http://127.0.0.1:${port}/home/`)
  }

  return (
    <AppLayout title={t('settings.webUI.pageTitle')}>
      <div className="flex gap-8">
        <SettingsSidebar />
        <div className="flex-1">
          <Card>
            <h1 className="text-xl font-bold text-white mb-4">{t('settings.webUI.title')}</h1>

            <div className="space-y-4 text-white/80">
              <div className="flex items-center justify-between gap-4">
                <span>{t('settings.webUI.enableWebUILabel')}</span>
                <div className="flex gap-2">
                  <Button
                    label={running ? t('settings.webUI.stopWebUIBtn') : t('settings.webUI.startWebUIBtn')}
                    onClick={toggleServer}
                    disabled={inWebUI}
                    className={running ? 'bg-red-800 hover:bg-red-700' : ''}
                  />
                  <Button
                    label={t('settings.webUI.openWebUIBtn')}
                    onClick={openInBrowser}
                  />
                </div>
              </div>

              {inWebUI && (
                <p className="text-orange-300 text-sm">
                  You are viewing Greenlight through WebUI. Server controls are disabled in this mode.
                </p>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.webui_autostart}
                  disabled={inWebUI}
                  onChange={(e) => {
                    const next = { ...settings, webui_autostart: e.target.checked }
                    setSettings(next)
                    syncToMain(next)
                  }}
                  className="accent-[#107C10]"
                />
                <span>
                  {t('settings.webUI.autostartLabel')} (
                  {settings.webui_autostart
                    ? t('settings.webUI.autostartEnabled')
                    : t('settings.webUI.autostartDisabled')}
                  )
                </span>
              </label>

              <div>
                <label className="block text-sm text-white/60 mb-1">{t('settings.webUI.portLabel')}</label>
                <input
                  type="number"
                  min={1024}
                  max={65535}
                  disabled={inWebUI}
                  className="w-32 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  placeholder={t('settings.webUI.portPlaceholder')}
                  value={settings.webui_port}
                  onChange={(e) => {
                    const next = { ...settings, webui_port: parseInt(e.target.value) || 9003 }
                    setSettings(next)
                    syncToMain(next)
                  }}
                />
              </div>

              <p className="text-white/40 text-sm">
                WebUI is available only on this machine at 127.0.0.1 (localhost). Authentication and streaming
                use HTTP tRPC in the browser.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}