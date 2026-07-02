export function marketFromLanguage(language: string): string {
	const normalized = language.trim().toLowerCase();
	const region = normalized.split('-')[1];
	if (region?.length === 2) {
		return region.toUpperCase();
	}

	return 'US';
}

export function buildStreamingToken(
	streaming: {
		market?: string;
		gsToken?: string;
	} | null | undefined,
	language: string
) {
	const resolvedLanguage = language || 'en-us';
	return {
		market: streaming?.market?.trim() || marketFromLanguage(resolvedLanguage),
		language: resolvedLanguage,
		token: streaming?.gsToken || ''
	};
}