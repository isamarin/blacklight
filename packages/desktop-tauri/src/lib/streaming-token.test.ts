import { describe, expect, it } from 'vitest';
import { buildStreamingToken, marketFromLanguage } from './streaming-token';

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
			token: 'abc'
		});
	});
});