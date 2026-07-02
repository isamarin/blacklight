const DEFAULT_API_PORT = 9003;
const API_PORT_STORAGE_KEY = 'blacklight-api-port';

let cachedApiPort: number | null = null;

export function getApiPort(): number {
	if (cachedApiPort !== null) {
		return cachedApiPort;
	}

	if (typeof localStorage !== 'undefined') {
		const stored = Number(localStorage.getItem(API_PORT_STORAGE_KEY));
		if (stored) {
			return stored;
		}
	}

	return DEFAULT_API_PORT;
}

export function setApiPort(port: number) {
	cachedApiPort = Number(port) || DEFAULT_API_PORT;
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(API_PORT_STORAGE_KEY, String(cachedApiPort));
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

export async function getApiHealth(): Promise<boolean> {
	try {
		const res = await fetch(`${getApiOrigin()}/health`);
		if (!res.ok) return false;
		const body = (await res.json()) as { ok?: boolean };
		return body.ok === true;
	} catch {
		return false;
	}
}