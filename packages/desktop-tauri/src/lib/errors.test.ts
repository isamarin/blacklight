import { describe, expect, it } from 'vitest';
import { classifyError, errorI18nKey, extractErrorMessage } from './errors';

describe('errors', () => {
	it('extractErrorMessage reads Error and plain values', () => {
		expect(extractErrorMessage(new Error('boom'))).toBe('boom');
		expect(extractErrorMessage({ message: 'from-object' })).toBe('from-object');
		expect(extractErrorMessage('plain')).toBe('plain');
	});

	it('classifyError maps known patterns', () => {
		expect(classifyError(new Error('streaming tokens missing'))).toBe('streaming_tokens');
		expect(classifyError(new Error('(xHomeToken) No correct token provided UNAUTHORIZED'))).toBe(
			'streaming_tokens'
		);
		expect(classifyError(new Error('web token expired'))).toBe('web_tokens');
		expect(classifyError(new Error('console wake timed out'))).toBe('console_wake_failed');
		expect(classifyError(new Error('Microphone permissions are denied'))).toBe('mic_failed');
		expect(classifyError(new Error('fetch failed'))).toBe('network');
		expect(
			classifyError(new Error('401 unauthorized uks.core.gssv-play-prod.xboxlive.com'))
		).toBe('region_mismatch');
		expect(classifyError(new Error('something else'))).toBe('unknown');
	});

	it('errorI18nKey prefixes codes', () => {
		expect(errorI18nKey('stream_timeout')).toBe('errors.codes.stream_timeout');
	});
});