import { describe, expect, it } from 'vitest';
import {
	isLikelyRegionMismatchError,
	resolveErrorWithRegionHint,
	shouldSuggestRegionIpFix,
	type RegionHintContext
} from './region-hint';

const webOnlyCtx: RegionHintContext = {
	hasWebToken: true,
	hasStreamingToken: false,
	forceRegionIp: undefined
};

const fullCtx: RegionHintContext = {
	hasWebToken: true,
	hasStreamingToken: true,
	forceRegionIp: undefined
};

const forcedCtx: RegionHintContext = {
	hasWebToken: true,
	hasStreamingToken: true,
	forceRegionIp: '194.25.0.68'
};

describe('region-hint', () => {
	it('detects GSSV unauthorized responses', () => {
		expect(
			isLikelyRegionMismatchError(new Error('401 unauthorized from uks.core.gssv-play-prod.xboxlive.com'))
		).toBe(true);
	});

	it('suggests region IP when web auth works but streaming tokens fail', () => {
		expect(
			shouldSuggestRegionIpFix('streaming_tokens', new Error('No gssv token found'), webOnlyCtx)
		).toBe(true);
	});

	it('does not suggest region IP when force region is already set', () => {
		expect(
			shouldSuggestRegionIpFix('region_mismatch', new Error('401 unauthorized gssv'), forcedCtx)
		).toBe(false);
	});

	it('resolves catalog auth failures to region_mismatch with streaming token', () => {
		expect(
			resolveErrorWithRegionHint(new Error('session expired on /v2/titles'), fullCtx)
		).toBe('region_mismatch');
	});
});