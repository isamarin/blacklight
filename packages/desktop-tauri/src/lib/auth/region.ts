import { getSettings } from '$lib/stores/settings.svelte';

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