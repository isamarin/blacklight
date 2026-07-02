import { isTauriApp } from '$lib/runtime';
import { getSettings, setSettings } from '$lib/stores/settings.svelte';
import { getSidecarSettings, restartApi, saveSidecarSettings } from '$lib/tauri';
import { resetTrpcClient } from '$lib/trpc';

export async function initDesktopShell() {
	if (!isTauriApp()) return;

	try {
		const sidecar = await getSidecarSettings();
		const current = getSettings();
		setSettings({
			...current,
			webui_autostart: sidecar.webui_autostart,
			webui_port: sidecar.webui_port
		});
		resetTrpcClient();
	} catch (e) {
		console.error('Failed to load sidecar settings from Tauri', e);
	}
}

export async function syncApiSettings(patch: {
	webui_autostart?: boolean;
	webui_port?: number;
}) {
	if (!isTauriApp()) return;

	try {
		await saveSidecarSettings(patch);
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