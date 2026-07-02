import { invoke } from '@tauri-apps/api/core';
import type { AppSettings } from '$lib/settings.defaults';
import { isTauriApp } from '$lib/runtime';

export interface AppInfo {
	version: string;
	productName: string;
	platform: string;
	dataDir: string;
	isTauri: boolean;
}

export interface SidecarSettings {
	webui_autostart: boolean;
	webui_port: number;
}

export async function tauriInvokeAvailable(): Promise<boolean> {
	return isTauriApp();
}

export async function getAppInfo(): Promise<AppInfo> {
	return invoke<AppInfo>('get_app_info');
}

export async function getSidecarSettings(): Promise<SidecarSettings> {
	return invoke<SidecarSettings>('get_sidecar_settings');
}

export async function saveSidecarSettings(
	patch: Partial<SidecarSettings>
): Promise<SidecarSettings> {
	return invoke<SidecarSettings>('save_sidecar_settings', {
		webuiAutostart: patch.webui_autostart,
		webuiPort: patch.webui_port
	});
}

export type AppSettingsPayload = Omit<AppSettings, 'webui_autostart' | 'webui_port'>;

export async function getAppSettingsFromTauri(): Promise<Partial<AppSettingsPayload>> {
	return invoke<Partial<AppSettingsPayload>>('get_app_settings');
}

export async function saveAppSettingsToTauri(settings: AppSettingsPayload): Promise<void> {
	await invoke('save_app_settings', { settings });
}

export async function getApiOriginFromTauri(): Promise<string> {
	return invoke<string>('get_api_origin');
}

export async function getTrpcUrlFromTauri(): Promise<string> {
	return invoke<string>('get_trpc_url');
}

export async function startApi(): Promise<void> {
	await invoke('start_api');
}

export async function stopApi(): Promise<void> {
	await invoke('stop_api');
}

export async function isApiRunning(): Promise<boolean> {
	return invoke<boolean>('is_api_running');
}

export async function restartApi(): Promise<void> {
	await invoke('restart_api');
}