import type { xCloudStreamConfig } from '@blacklight/player/client';

export function parseStreamRoute(serverid: string): { type: 'home' | 'cloud'; id: string } {
	if (serverid.startsWith('xcloud_')) {
		return { type: 'cloud', id: serverid.slice(7) };
	}
	return { type: 'home', id: serverid };
}

export function buildStreamConfig(
	id: string,
	type: 'home' | 'cloud',
	language: string,
	resolution: 720 | 1080 = 1080,
	coreHost?: string
): xCloudStreamConfig {
	const fallback =
		type === 'cloud'
			? 'https://uks.core.gssv-play-prod.xboxlive.com'
			: 'https://uks.core.gssv-play-prodxhome.xboxlive.com';
	const host = coreHost
		? coreHost.startsWith('https://')
			? coreHost
			: `https://${coreHost}`
		: fallback;

	return {
		id,
		type,
		language,
		host,
		resolution
	};
}