import { isTauriApp } from '$lib/runtime';
import { getSettings, setSettings } from '$lib/stores/settings.svelte';
import { getSidecarSettings, saveSidecarSettings } from '$lib/tauri';
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

export async function syncSidecarSettings(patch: {
	webui_autostart?: boolean;
	webui_port?: number;
}) {
	if (!isTauriApp()) return;

	try {
		await saveSidecarSettings(patch);
		resetTrpcClient();
	} catch (e) {
		console.error('Failed to save sidecar settings via Tauri', e);
		throw e;
	}
}