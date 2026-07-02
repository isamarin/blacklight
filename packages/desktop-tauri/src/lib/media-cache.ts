import { getApiOrigin } from '$lib/runtime';

export type MediaPreset = 'tile' | 'cover' | 'icon' | 'poster';

export function normalizeMediaUrl(raw: string | null | undefined): string | null {
	if (!raw?.trim()) return null;

	const trimmed = raw.trim();
	if (trimmed.startsWith('//')) {
		return `https:${trimmed}`;
	}

	try {
		return new URL(trimmed).toString();
	} catch {
		return null;
	}
}

export function cachedMediaUrl(
	remoteUrl: string | null | undefined,
	preset: MediaPreset
): string | undefined {
	const normalized = normalizeMediaUrl(remoteUrl);
	if (!normalized) return undefined;

	const params = new URLSearchParams({
		url: normalized,
		preset
	});

	return `${getApiOrigin()}/media?${params.toString()}`;
}