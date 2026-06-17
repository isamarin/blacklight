import AppLayout from '../../components/layout/AppLayout'
import SettingsSidebar from '../../components/settings/SettingsSidebar'
import Card from '../../components/ui/Card'
import { useSettings } from '../../contexts/SettingsContext'

export default function SettingsInputPage() {
  const { settings, setSettings } = useSettings()

  const toggle = (
    key: 'controller_vibration' | 'input_mousekeyboard' | 'input_touch' | 'input_newgamepad',
  ) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  return (
    <AppLayout title="Input Settings">
      <div className="flex gap-8">
        <SettingsSidebar />
        <div className="flex-1 space-y-4">
          {(
            [
              ['controller_vibration', 'Controller vibration'],
              ['input_mousekeyboard', 'Mouse & keyboard'],
              ['input_touch', 'Touch controls'],
              ['input_newgamepad', 'New gamepad driver'],
            ] as const
          ).map(([key, label]) => (
            <Card key={key}>
              <label className="flex items-center gap-3 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key] as boolean}
                  onChange={() => toggle(key as 'controller_vibration' | 'input_mousekeyboard' | 'input_touch' | 'input_newgamepad')}
                  className="accent-[#107C10]"
                />
                {label}
              </label>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}