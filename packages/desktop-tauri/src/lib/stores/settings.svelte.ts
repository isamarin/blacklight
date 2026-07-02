import { defaultSettings, type AppSettings } from '$lib/settings.defaults';
import { isTauriApp, setApiPort } from '$lib/runtime';
import { saveAppSettingsToTauri, type AppSettingsPayload } from '$lib/tauri';
import { resetTrpcClient } from '$lib/trpc';

const STORAGE_KEY = 'blacklight-settings';
const PERSIST_DEBOUNCE_MS = 300;

let settings = $state<AppSettings>({ ...defaultSettings });
let loaded = $state(false);
let persistEnabled = $state(false);
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function loadFromLocalStorage(): AppSettings | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) return null;
		return { ...defaultSettings, ...JSON.parse(saved) };
	} catch (e) {
		console.error('Failed to load settings from localStorage', e);
		return null;
	}
}

export function appSettingsForDisk(next: AppSettings): AppSettingsPayload {
	const { webui_autostart: _autostart, webui_port: _port, ...rest } = next;
	return rest;
}

if (typeof window !== 'undefined' && !isTauriApp()) {
	const fromStorage = loadFromLocalStorage();
	if (fromStorage) {
		settings = fromStorage;
	}
	loaded = true;
	persistEnabled = true;
}

$effect(() => {
	if (!persistEnabled || !loaded) return;

	const snapshot = settings;
	setApiPort(snapshot.webui_port);
	resetTrpcClient();

	if (isTauriApp()) {
		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			void saveAppSettingsToTauri(appSettingsForDisk(snapshot)).catch((e) => {
				console.error('Failed to persist app settings via Tauri', e);
			});
		}, PERSIST_DEBOUNCE_MS);
		return;
	}

	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	}
});

export function getSettings() {
	return settings;
}

export function setSettings(next: AppSettings) {
	settings = next;
}

export function hydrateSettings(next: AppSettings) {
	settings = next;
	loaded = true;
	persistEnabled = true;
}

export function settingsAreLoaded() {
	return loaded;
}