import i18n from 'i18next';
import enUS from '$lib/languages/en-US.json';
import deDE from '$lib/languages/de-DE.json';
import ruRU from '$lib/languages/ru-RU.json';
import ukUA from '$lib/languages/uk-UA.json';

const resources = {
	'en-US': { translation: enUS.translation },
	'de-DE': { translation: deDE.translation },
	'ru-RU': { translation: ruRU.translation },
	'uk-UA': { translation: ukUA.translation }
};

let initialized = false;
let renderEpoch = 0;

function bumpRenderEpoch() {
	renderEpoch += 1;
}

function normalizeLanguage(language: string | null | undefined): string {
	if (typeof language !== 'string') return 'en-US';
	const normalized = language.trim();
	return normalized || 'en-US';
}

export async function initI18n(language: string | null | undefined) {
	const lng = normalizeLanguage(language);

	if (!initialized) {
		await i18n.init({
			resources,
			lng,
			fallbackLng: 'en-US',
			interpolation: { escapeValue: false }
		});
		initialized = true;
		bumpRenderEpoch();
		return i18n;
	}

	if (i18n.language !== lng) {
		await i18n.changeLanguage(lng);
		bumpRenderEpoch();
	}

	return i18n;
}

export function isI18nReady() {
	return initialized;
}

export function t(key: string, options?: Record<string, unknown>): string {
	void renderEpoch;
	return String(i18n.t(key, options));
}

export { i18n };