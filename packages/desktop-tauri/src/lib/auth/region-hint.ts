import { classifyError, errorText, type UserErrorCode } from '$lib/errors';

export type RegionHintContext = {
	hasWebToken: boolean;
	hasStreamingToken: boolean;
	forceRegionIp?: string;
};

export function isLikelyRegionMismatchError(error: unknown): boolean {
	const text = errorText(error);

	if (
		text.includes('gssv') ||
		text.includes('gssv-play-prod') ||
		text.includes('gssv-play-prodxhome') ||
		text.includes('catalog.gamepass.com') ||
		text.includes('/v2/titles')
	) {
		if (
			text.includes('401') ||
			text.includes('403') ||
			text.includes('unauthorized') ||
			text.includes('forbidden')
		) {
			return true;
		}
	}

	if (text.includes('session') && text.includes('expired')) {
		if (
			text.includes('gssv') ||
			text.includes('xhome') ||
			text.includes('xcloud') ||
			text.includes('/v2/titles')
		) {
			return true;
		}
	}

	return false;
}

export function shouldSuggestRegionIpFix(
	code: UserErrorCode,
	error: unknown,
	ctx: RegionHintContext
): boolean {
	if (ctx.forceRegionIp) return false;
	if (!ctx.hasWebToken) return false;

	if (code === 'region_mismatch') return true;
	if (isLikelyRegionMismatchError(error)) return true;

	if (code === 'catalog_missing_token') return false;
	if (code === 'web_tokens') return false;
	if (code === 'network' || code === 'catalog_timeout') return false;

	if (code === 'streaming_tokens') return true;

	if ((code === 'auth_expired' || code === 'unknown') && ctx.hasStreamingToken) {
		return true;
	}

	return false;
}

export function resolveErrorWithRegionHint(
	error: unknown,
	ctx: RegionHintContext
): UserErrorCode {
	const code = classifyError(error);

	if (isLikelyRegionMismatchError(error)) {
		return 'region_mismatch';
	}

	if (shouldSuggestRegionIpFix(code, error, ctx)) {
		return 'region_mismatch';
	}

	return code;
}