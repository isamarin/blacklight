import { getSettings } from '$lib/stores/settings.svelte';

export const REGION_IP_PRESETS = [
	{ value: '', labelKey: 'settings.streaming.setRegionValueDisabled' },
	{ value: '203.41.44.20', labelKey: 'settings.streaming.setRegionValueAustralia' },
	{ value: '200.221.11.101', labelKey: 'settings.streaming.setRegionValueBrazil' },
	{ value: '194.25.0.68', labelKey: 'settings.streaming.setRegionValueEurope' },
	{ value: '122.1.0.154', labelKey: 'settings.streaming.setRegionValueJapan' },
	{ value: '203.253.64.1', labelKey: 'settings.streaming.setRegionValueKorea' },
	{ value: '4.2.2.2', labelKey: 'settings.streaming.setRegionValueUS' }
] as const;

export function authForceRegionIp(): string | undefined {
	const ip = getSettings().force_region_ip?.trim();
	return ip || undefined;
}

export function withAuthRegion<T extends object>(
	payload: T
): T & { force_region_ip?: string } {
	const ip = authForceRegionIp();
	if (!ip) return payload;
	return { ...payload, force_region_ip: ip };
}