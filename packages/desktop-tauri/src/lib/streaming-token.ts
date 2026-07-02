type OfferingRegion = { isDefault?: boolean; baseUri?: string };
type OfferingSettings = { regions?: OfferingRegion[] };

export type StreamingTokenData = {
	market?: string;
	gsToken?: string;
	offeringSettings?: OfferingSettings;
};

export function resolveStreamingTokenData(
	token: ({ data?: StreamingTokenData } & StreamingTokenData) | null | undefined
): StreamingTokenData | undefined {
	if (!token) return undefined;
	if (token.data && typeof token.data === 'object') return token.data;
	if ('gsToken' in token || 'offeringSettings' in token || 'market' in token) {
		return token;
	}
	return undefined;
}

export function normalizeCatalogLanguage(language: string | null | undefined): string {
	if (typeof language !== 'string') return 'en-US';

	const trimmed = language.trim();
	if (!trimmed) return 'en-US';

	const parts = trimmed.split('-');
	if (parts.length >= 2) {
		return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
	}

	return `${parts[0].toLowerCase()}-US`;
}

export function defaultXHomeCoreHost(market?: string | null): string {
	const normalized = market?.trim().toUpperCase();
	if (normalized === 'US') return 'eastus.core.gssv-play-prodxhome.xboxlive.com';
	if (normalized === 'JP') return 'japaneast.core.gssv-play-prodxhome.xboxlive.com';
	if (normalized === 'AU') return 'australiaeast.core.gssv-play-prodxhome.xboxlive.com';
	if (normalized === 'RU') return 'weu.core.gssv-play-prodxhome.xboxlive.com';
	return 'uks.core.gssv-play-prodxhome.xboxlive.com';
}

export function marketFromLanguage(language: string | null | undefined): string {
	if (typeof language !== 'string') return 'US';

	const normalized = language.trim().toLowerCase();
	if (!normalized) return 'US';

	const region = normalized.split('-')[1];
	if (region?.length === 2) {
		return region.toUpperCase();
	}

	return 'US';
}

export function coreHostFromOfferingSettings(
	offeringSettings?: OfferingSettings | null
): string | undefined {
	const regions = offeringSettings?.regions;
	if (!regions?.length) return undefined;

	const region = regions.find((entry) => entry.isDefault) ?? regions[0];
	const baseUri = region?.baseUri?.trim();
	if (!baseUri) return undefined;

	return baseUri.startsWith('https://')
		? baseUri.slice(8)
		: baseUri.replace(/^https?:\/\//, '');
}

export function streamHostFromCoreHost(coreHost?: string): string | undefined {
	if (!coreHost?.trim()) return undefined;
	const host = coreHost.trim();
	return host.startsWith('https://') ? host : `https://${host}`;
}

export function buildStreamingToken(
	streaming:
		| ({ data?: StreamingTokenData } & StreamingTokenData)
		| null
		| undefined,
	language?: string | null
) {
	const resolvedLanguage = normalizeCatalogLanguage(language);
	const tokenData = resolveStreamingTokenData(streaming);
	const market =
		(typeof tokenData?.market === 'string' && tokenData.market.trim()) ||
		marketFromLanguage(resolvedLanguage);

	return {
		market,
		language: resolvedLanguage,
		token: tokenData?.gsToken || '',
		coreHost:
			coreHostFromOfferingSettings(tokenData?.offeringSettings) ??
			defaultXHomeCoreHost(market)
	};
}