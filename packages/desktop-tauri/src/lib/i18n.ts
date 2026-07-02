import i18n from 'i18next';
import enUS from '$lib/languages/en-US.json';
import deDE from '$lib/languages/de-DE.json';
import ruRU from '$lib/languages/ru-RU.json';
import ukUA from '$lib/languages/uk-UA.json';

const resources = {
	'en-US': { translation: enUS },
	'de-DE': { translation: deDE },
	'ru-RU': { translation: ruRU },
	'uk-UA': { translation: ukUA }
};

let initialized = false;

export async function initI18n(language: string) {
	if (!initialized) {
		await i18n.init({
			resources,
			lng: language,
			fallbackLng: 'en-US',
			interpolation: { escapeValue: false }
		});
		initialized = true;
		return i18n;
	}

	await i18n.changeLanguage(language);
	return i18n;
}

export function t(key: string, options?: Record<string, unknown>): string {
	return i18n.t(key, options);
}

export { i18n };