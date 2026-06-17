import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { TrpcProviderComponent } from '../providers/trpc'
import { AuthProvider } from '../contexts/AuthContext'
import { SettingsProvider, useSettings } from '../contexts/SettingsContext'
import { TitleCatalogProvider } from '../contexts/TitleCatalogContext'
import App from './app'
import { initI18n } from '../lib/i18n'
import i18n from '../lib/i18n'

import '../styles/globals.css'
import '@greenlight/player/client.css'

function I18nBootstrap({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()

  useEffect(() => {
    initI18n(settings.language)
  }, [settings.language])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

function GreenlightDesktop({ Component, pageProps }: AppProps) {
  return (
    <TrpcProviderComponent>
      <AuthProvider>
        <SettingsProvider>
          <I18nBootstrap>
            <TitleCatalogProvider>
              <App>
                <Component {...pageProps} />
              </App>
            </TitleCatalogProvider>
          </I18nBootstrap>
        </SettingsProvider>
      </AuthProvider>
    </TrpcProviderComponent>
  )
}

export default GreenlightDesktop