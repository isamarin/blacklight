import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import SettingsSidebar from '../../components/settings/SettingsSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'

const languages = [
  { code: 'en-US', label: 'English' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'ru-RU', label: 'Русский' },
  { code: 'uk-UA', label: 'Українська' },
]

export default function SettingsHomePage() {
  const { t } = useTranslation()
  const { logout, authState } = useAuth()
  const { settings, setSettings } = useSettings()
  const gamertag = (authState?.webToken?.data.DisplayClaims?.xui?.[0] as any)?.gtg

  return (
    <AppLayout title={t('page.settings.about.pageTitle', { defaultValue: 'Settings' })}>
      <div className="flex gap-8">
        <SettingsSidebar />
        <div className="flex-1 space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-white mb-2">
              {t('page.settings.about.profileTitle', { defaultValue: 'Profile' })}
            </h2>
            <p className="text-white/70">{gamertag}</p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-white mb-2">
              {t('page.settings.about.languageTitle', { defaultValue: 'Language' })}
            </h2>
            <select
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </Card>
          <Card>
            <p className="text-white/40 text-sm mb-3">
              <a
                href="https://github.com/isamarin/greenlight"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white/60"
              >
                github.com/isamarin/greenlight
              </a>
            </p>
            <Button label="Logout" onClick={logout} className="bg-red-900 hover:bg-red-800" />
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}