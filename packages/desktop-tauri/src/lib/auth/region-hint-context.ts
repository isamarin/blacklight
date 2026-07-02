import { authForceRegionIp } from '$lib/auth/region';
import {
	resolveErrorWithRegionHint,
	type RegionHintContext
} from '$lib/auth/region-hint';
import type { UserErrorCode } from '$lib/errors';
import { getWebToken, hasStreamingTokens } from '$lib/stores/auth.svelte';

export function buildRegionHintContext(): RegionHintContext {
	return {
		hasWebToken: Boolean(getWebToken().token),
		hasStreamingToken: hasStreamingTokens(),
		forceRegionIp: authForceRegionIp()
	};
}

export function resolveAppErrorWithRegionHint(error: unknown): UserErrorCode {
	return resolveErrorWithRegionHint(error, buildRegionHintContext());
}