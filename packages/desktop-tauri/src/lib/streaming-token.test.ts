import { describe, expect, it } from 'vitest';
import {
	buildStreamingToken,
	coreHostFromOfferingSettings,
	marketFromLanguage,
	resolveStreamingTokenData,
	streamHostFromCoreHost
} from './streaming-token';

describe('streaming-token', () => {
	it('marketFromLanguage maps locale regions', () => {
		expect(marketFromLanguage('en-US')).toBe('US');
		expect(marketFromLanguage('ru-RU')).toBe('RU');
		expect(marketFromLanguage('de')).toBe('US');
	});

	it('buildStreamingToken falls back to locale market', () => {
		expect(buildStreamingToken({ gsToken: 'abc' }, 'ru-RU')).toEqual({
			market: 'RU',
			language: 'ru-RU',
			token: 'abc',
			coreHost: undefined
		});
	});

	it('marketFromLanguage tolerates missing language', () => {
		expect(marketFromLanguage(undefined)).toBe('US');
		expect(marketFromLanguage('')).toBe('US');
	});

	it('resolveStreamingTokenData reads nested and flat token shapes', () => {
		expect(
			resolveStreamingTokenData({
				data: { gsToken: 'nested', market: 'US' }
			})
		).toEqual({ gsToken: 'nested', market: 'US' });
		expect(resolveStreamingTokenData({ gsToken: 'flat', market: 'RU' })).toEqual({
			gsToken: 'flat',
			market: 'RU'
		});
	});

	it('coreHostFromOfferingSettings picks default region', () => {
		expect(
			coreHostFromOfferingSettings({
				regions: [
					{ baseUri: 'https://weu.core.gssv-play-prod.xboxlive.com', isDefault: false },
					{ baseUri: 'https://uks.core.gssv-play-prodxhome.xboxlive.com', isDefault: true }
				]
			})
		).toBe('uks.core.gssv-play-prodxhome.xboxlive.com');
	});

	it('streamHostFromCoreHost normalizes host', () => {
		expect(streamHostFromCoreHost('uks.core.gssv-play-prod.xboxlive.com')).toBe(
			'https://uks.core.gssv-play-prod.xboxlive.com'
		);
	});
});