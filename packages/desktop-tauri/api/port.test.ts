import { describe, expect, it } from 'vitest';
import { parseSidecarSettings, resolveApiPort } from './port';

describe('resolveApiPort', () => {
	it('prefers env port when valid', () => {
		expect(resolveApiPort({ envPort: '9100' })).toBe(9100);
	});

	it('falls back to sidecar settings', () => {
		expect(resolveApiPort({ settings: { webui_port: 3847 } })).toBe(3847);
	});

	it('defaults to 9003 for invalid values', () => {
		expect(resolveApiPort({ envPort: '22', settings: { webui_port: 1 } })).toBe(9003);
		expect(resolveApiPort({})).toBe(9003);
	});
});

describe('parseSidecarSettings', () => {
	it('parses valid json', () => {
		expect(parseSidecarSettings('{"webui_port":3847}')).toEqual({ webui_port: 3847 });
	});

	it('returns undefined for invalid json', () => {
		expect(parseSidecarSettings('not-json')).toBeUndefined();
	});
});