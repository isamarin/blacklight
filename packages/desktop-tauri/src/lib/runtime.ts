import { getSettings } from '$lib/stores/settings.svelte';

const DEFAULT_API_PORT = 9003;
const API_PORT_STORAGE_KEY = 'blacklight-api-port';

export function getApiPort(): number {
	if (typeof window !== 'undefined') {
		try {
			const fromSettings = getSettings().webui_port;
			if (fromSettings) return Number(fromSettings) || DEFAULT_API_PORT;
		} catch {
			// settings store not ready during SSR
		}
	}
	if (typeof localStorage === 'undefined') {
		return DEFAULT_API_PORT;
	}
	return Number(localStorage.getItem(API_PORT_STORAGE_KEY)) || DEFAULT_API_PORT;
}

export function setApiPort(port: number) {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(API_PORT_STORAGE_KEY, String(port));
	}
}

export function getApiOrigin(): string {
	return `http://127.0.0.1:${getApiPort()}`;
}

export function isTauriApp(): boolean {
	return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function isWebUIMode(): boolean {
	return typeof window !== 'undefined' && !isTauriApp();
}

export function isDesktopShell(): boolean {
	return isTauriApp();
}

export function getTrpcHttpUrl(): string {
	if (typeof window === 'undefined') {
		return '/trpc';
	}

	if (isDesktopShell()) {
		return `${getApiOrigin()}/trpc`;
	}

	return '/trpc';
}

export async function openExternal(url: string): Promise<void> {
	if (isTauriApp()) {
		const { openUrl } = await import('@tauri-apps/plugin-opener');
		await openUrl(url);
		return;
	}

	window.open(url, '_blank', 'noopener,noreferrer');
}

async function sidecarFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${getApiOrigin()}${path}`, {
		...init,
		headers: {
			'content-type': 'application/json',
			...(init?.headers ?? {})
		}
	});
	if (!res.ok) {
		throw new Error(`Sidecar ${path} failed: ${res.status}`);
	}
	return res.json() as Promise<T>;
}

export const tauriSidecar = {
	getStatus(): Promise<boolean> {
		return sidecarFetch<{ running: boolean }>('/api/webui/status').then((r) => r.running);
	},
	start(port?: number): Promise<boolean> {
		return sidecarFetch<{ running: boolean }>('/api/webui/start', {
			method: 'POST',
			body: JSON.stringify({ port })
		}).then((r) => r.running);
	},
	stop(): Promise<boolean> {
		return sidecarFetch<{ running: boolean }>('/api/webui/stop', { method: 'POST' }).then(
			(r) => r.running
		);
	},
	getSettings(): Promise<{ webui_autostart: boolean; webui_port: number }> {
		return sidecarFetch('/api/webui/settings');
	},
	saveSettings(settings: { webui_autostart?: boolean; webui_port?: number }) {
		return sidecarFetch('/api/webui/settings', {
			method: 'POST',
			body: JSON.stringify(settings)
		});
	}
};

export function getWebuiApi() {
	if (isTauriApp() || isWebUIMode()) {
		return tauriSidecar;
	}
	return undefined;
}