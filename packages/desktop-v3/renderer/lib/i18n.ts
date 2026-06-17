import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enUS from '../languages/en-US.json'
import deDE from '../languages/de-DE.json'
import ruRU from '../languages/ru-RU.json'
import ukUA from '../languages/uk-UA.json'

const resources = {
  'en-US': enUS,
  'de-DE': deDE,
  'ru-RU': ruRU,
  'uk-UA': ukUA,
}

export async function initI18n(language: string) {
  if (i18n.isInitialized) {
    await i18n.changeLanguage(language)
    return i18n
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en-US',
    interpolation: { escapeValue: false },
  })

  return i18n
}

export default i18n