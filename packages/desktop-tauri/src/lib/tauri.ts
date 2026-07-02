import { invoke } from '@tauri-apps/api/core';
import type { AppSettings } from '$lib/settings.defaults';
import { isTauriApp } from '$lib/runtime';

const IPC_RETRY_ATTEMPTS = 8;
const IPC_RETRY_BASE_MS = 150;

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function invokeWithRetry<T>(
	cmd: string,
	args?: Record<string, unknown>,
	attempts = IPC_RETRY_ATTEMPTS
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 0; attempt < attempts; attempt++) {
		try {
			return await invoke<T>(cmd, args);
		} catch (error) {
			lastError = error;
			if (attempt === attempts - 1) break;
			await sleep(IPC_RETRY_BASE_MS * (attempt + 1));
		}
	}

	throw lastError;
}

export async function waitForTauriIpc(): Promise<void> {
	if (!isTauriApp()) return;

	for (let attempt = 0; attempt < IPC_RETRY_ATTEMPTS; attempt++) {
		try {
			await invoke<boolean>('is_api_running');
			return;
		} catch {
			await sleep(IPC_RETRY_BASE_MS * (attempt + 1));
		}
	}
}

export interface AppInfo {
	version: string;
	productName: string;
	platform: string;
	dataDir: string;
	isTauri: boolean;
	isPackaged: boolean;
}

export interface SidecarSettings {
	webui_autostart: boolean;
	webui_port: number;
}

export async function tauriInvokeAvailable(): Promise<boolean> {
	return isTauriApp();
}

export async function getAppInfo(): Promise<AppInfo> {
	return invokeWithRetry<AppInfo>('get_app_info');
}

export async function getSidecarSettings(): Promise<SidecarSettings> {
	return invokeWithRetry<SidecarSettings>('get_sidecar_settings');
}

export async function saveSidecarSettings(
	patch: Partial<SidecarSettings>
): Promise<SidecarSettings> {
	return invokeWithRetry<SidecarSettings>('save_sidecar_settings', {
		webuiAutostart: patch.webui_autostart,
		webuiPort: patch.webui_port
	});
}

export type AppSettingsPayload = Omit<AppSettings, 'webui_autostart' | 'webui_port'>;

export async function getAppSettingsFromTauri(): Promise<Partial<AppSettingsPayload>> {
	return invokeWithRetry<Partial<AppSettingsPayload>>('get_app_settings');
}

export async function saveAppSettingsToTauri(settings: AppSettingsPayload): Promise<void> {
	await invokeWithRetry('save_app_settings', { settings });
}

export async function getUserTokenFromTauri<T = Record<string, unknown>>(): Promise<T | null> {
	return invokeWithRetry<T | null>('get_user_token');
}

export async function saveUserTokenToTauri(token: object): Promise<void> {
	await invokeWithRetry('save_user_token', { token });
}

export async function clearUserTokenFromTauri(): Promise<void> {
	await invokeWithRetry('clear_user_token');
}

export async function clearAppDataFromTauri(): Promise<void> {
	await invokeWithRetry('clear_app_data');
}

export async function getApiOriginFromTauri(): Promise<string> {
	return invokeWithRetry<string>('get_api_origin');
}

export async function getTrpcUrlFromTauri(): Promise<string> {
	return invokeWithRetry<string>('get_trpc_url');
}

export async function startApi(): Promise<void> {
	await invokeWithRetry('start_api');
}

export async function stopApi(): Promise<void> {
	await invokeWithRetry('stop_api');
}

export async function isApiRunning(): Promise<boolean> {
	return invokeWithRetry<boolean>('is_api_running');
}

export async function restartApi(): Promise<void> {
	await invokeWithRetry('restart_api');
}