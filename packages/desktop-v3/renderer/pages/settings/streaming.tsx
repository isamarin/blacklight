import type { VideoRendererMode } from '@blacklight/player/client'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import SettingsSidebar from '../../components/settings/SettingsSidebar'
import Card from '../../components/ui/Card'
import { useSettings } from '../../contexts/SettingsContext'

const VIDEO_RENDERER_OPTIONS: VideoRendererMode[] = ['auto', 'webgpu', 'video']

const VIDEO_RENDERER_I18N_KEYS: Record<VideoRendererMode, string> = {
  auto: 'page.settings.streaming.videoRendererValueAuto',
  webgpu: 'page.settings.streaming.videoRendererValueWebgpu',
  video: 'page.settings.streaming.videoRendererValueVideo',
}

export default function SettingsStreamingPage() {
  const { settings, setSettings } = useSettings()
  const { t } = useTranslation()

  return (
    <AppLayout title="Streaming Settings">
      <div className="flex gap-8">
        <SettingsSidebar />
        <div className="flex-1 space-y-4">
          <Card>
            <label className="block text-white/70 text-sm mb-2">
              {t('page.settings.streaming.videoRendererLabel', { defaultValue: 'Video renderer' })}
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              value={settings.video_renderer}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  video_renderer: e.target.value as VideoRendererMode,
                })
              }
            >
              {VIDEO_RENDERER_OPTIONS.map((mode) => (
                <option key={mode} value={mode}>
                  {t(VIDEO_RENDERER_I18N_KEYS[mode], { defaultValue: mode })}
                </option>
              ))}
            </select>
          </Card>
          <Card>
            <label className="block text-white/70 text-sm mb-2">xCloud bitrate (0 = auto)</label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              value={settings.xcloud_bitrate}
              onChange={(e) =>
                setSettings({ ...settings, xcloud_bitrate: parseInt(e.target.value) || 0 })
              }
            />
          </Card>
          <Card>
            <label className="block text-white/70 text-sm mb-2">xHome bitrate (0 = auto)</label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              value={settings.xhome_bitrate}
              onChange={(e) =>
                setSettings({ ...settings, xhome_bitrate: parseInt(e.target.value) || 0 })
              }
            />
          </Card>
          <Card>
            <label className="block text-white/70 text-sm mb-2">Preferred game language</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              value={settings.preferred_game_language}
              onChange={(e) =>
                setSettings({ ...settings, preferred_game_language: e.target.value })
              }
            />
          </Card>
          <Card>
            <label className="block text-white/70 text-sm mb-2">Force region IP</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              value={settings.force_region_ip}
              onChange={(e) => setSettings({ ...settings, force_region_ip: e.target.value })}
            />
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}