import { describe, expect, it } from 'vitest';
import { isAllowedOrigin } from './cors';

describe('isAllowedOrigin', () => {
	it('allows local http(s) origins', () => {
		expect(isAllowedOrigin('http://127.0.0.1:4173')).toBe(true);
		expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
		expect(isAllowedOrigin('https://tauri.localhost')).toBe(true);
	});

	it('allows the macOS Tauri custom protocol', () => {
		expect(isAllowedOrigin('tauri://localhost')).toBe(true);
	});

	it('rejects missing, opaque, and remote origins', () => {
		expect(isAllowedOrigin(undefined)).toBe(false);
		expect(isAllowedOrigin('')).toBe(false);
		expect(isAllowedOrigin('null')).toBe(false);
		expect(isAllowedOrigin('https://example.com')).toBe(false);
		expect(isAllowedOrigin('file://localhost')).toBe(false);
	});
});
