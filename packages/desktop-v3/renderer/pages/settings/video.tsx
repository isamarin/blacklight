import AppLayout from '../../components/layout/AppLayout'
import SettingsSidebar from '../../components/settings/SettingsSidebar'
import Card from '../../components/ui/Card'
import { useSettings } from '../../contexts/SettingsContext'

export default function SettingsVideoPage() {
  const { settings, setSettings } = useSettings()

  return (
    <AppLayout title="Video Settings">
      <div className="flex gap-8">
        <SettingsSidebar />
        <div className="flex-1 space-y-4">
          <Card>
            <label className="flex items-center gap-3 text-white/80">
              <input
                type="checkbox"
                checked={settings.video_enabled}
                onChange={() => setSettings({ ...settings, video_enabled: !settings.video_enabled })}
                className="accent-[#107C10]"
              />
              Enable video
            </label>
          </Card>
          <Card>
            <label className="flex items-center gap-3 text-white/80">
              <input
                type="checkbox"
                checked={settings.audio_enabled}
                onChange={() => setSettings({ ...settings, audio_enabled: !settings.audio_enabled })}
                className="accent-[#107C10]"
              />
              Enable audio
            </label>
          </Card>
          <Card>
            <label className="flex items-center gap-3 text-white/80">
              <input
                type="checkbox"
                checked={settings.app_lowresolution}
                onChange={() =>
                  setSettings({ ...settings, app_lowresolution: !settings.app_lowresolution })
                }
                className="accent-[#107C10]"
              />
              Low resolution mode (720p)
            </label>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}