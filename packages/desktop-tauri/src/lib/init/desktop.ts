import { isTauriApp } from '$lib/runtime';
import { defaultSettings } from '$lib/settings.defaults';
import {
	appSettingsForDisk,
	getSettings,
	hydrateSettings,
	setSettings
} from '$lib/stores/settings.svelte';
import {
	getAppSettingsFromTauri,
	getSidecarSettings,
	restartApi,
	saveAppSettingsToTauri,
	saveSidecarSettings
} from '$lib/tauri';
import { resetTrpcClient } from '$lib/trpc';

const STORAGE_KEY = 'blacklight-settings';

function loadLegacyLocalStorage(): Partial<typeof defaultSettings> | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) return null;
		return JSON.parse(saved) as Partial<typeof defaultSettings>;
	} catch {
		return null;
	}
}

export async function initDesktopShell() {
	if (!isTauriApp()) return;

	try {
		const [appSettings, apiSettings] = await Promise.all([
			getAppSettingsFromTauri(),
			getSidecarSettings()
		]);

		let merged = {
			...defaultSettings,
			...appSettings,
			webui_autostart: apiSettings.webui_autostart,
			webui_port: apiSettings.webui_port
		};

		const hasAppSettingsFile = Object.keys(appSettings).length > 0;
		if (!hasAppSettingsFile) {
			const legacy = loadLegacyLocalStorage();
			if (legacy) {
				merged = {
					...merged,
					...legacy,
					webui_autostart: apiSettings.webui_autostart,
					webui_port: apiSettings.webui_port
				};
				await saveAppSettingsToTauri(appSettingsForDisk(merged));
			}
		}

		hydrateSettings(merged);
		resetTrpcClient();
	} catch (e) {
		console.error('Failed to load settings from Tauri', e);
		const legacy = loadLegacyLocalStorage();
		if (legacy) {
			hydrateSettings({ ...defaultSettings, ...legacy });
		}
	}
}

export async function syncApiSettings(patch: {
	webui_autostart?: boolean;
	webui_port?: number;
}) {
	if (!isTauriApp()) return;

	try {
		const saved = await saveSidecarSettings(patch);
		const current = getSettings();
		setSettings({
			...current,
			webui_autostart: saved.webui_autostart,
			webui_port: saved.webui_port
		});
		resetTrpcClient();
		if (patch.webui_port !== undefined) {
			await restartApi();
		}
	} catch (e) {
		console.error('Failed to save API settings via Tauri', e);
		throw e;
	}
}

/** @deprecated use syncApiSettings */
export const syncSidecarSettings = syncApiSettings;