import { getApiHealth, isTauriApp } from '$lib/runtime';
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
	isApiRunning,
	restartApi,
	saveAppSettingsToTauri,
	saveSidecarSettings,
	startApi,
	waitForTauriIpc
} from '$lib/tauri';
import { resetTrpcClient } from '$lib/trpc';

const STORAGE_KEY = 'blacklight-settings';
const API_HEALTH_TIMEOUT_MS = 15_000;
const API_HEALTH_POLL_MS = 250;

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForApiHealth() {
	const deadline = Date.now() + API_HEALTH_TIMEOUT_MS;
	while (Date.now() < deadline) {
		if (await getApiHealth()) return;
		await sleep(API_HEALTH_POLL_MS);
	}

	throw new Error('API failed to start');
}

async function ensureApiRunning() {
	if (!(await isApiRunning())) {
		await startApi();
	}

	try {
		await waitForApiHealth();
		return;
	} catch {
		await restartApi();
		await waitForApiHealth();
	}
}

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
		await waitForTauriIpc();
		await ensureApiRunning();
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
			resetTrpcClient();
			return;
		}
		throw e;
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