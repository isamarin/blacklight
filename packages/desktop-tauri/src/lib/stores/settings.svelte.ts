import { defaultSettings, type AppSettings } from '$lib/settings.defaults';

const STORAGE_KEY = 'blacklight-settings';

let settings = $state<AppSettings>({ ...defaultSettings });
let loaded = $state(false);

if (typeof localStorage !== 'undefined') {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			settings = { ...defaultSettings, ...JSON.parse(saved) };
		}
	} catch (e) {
		console.error('Failed to load settings', e);
	}
	loaded = true;
}

$effect(() => {
	if (!loaded || typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
});

export function getSettings() {
	return settings;
}

export function setSettings(next: AppSettings) {
	settings = next;
}