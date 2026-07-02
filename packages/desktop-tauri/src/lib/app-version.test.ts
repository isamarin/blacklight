import { afterEach, describe, expect, it, vi } from 'vitest';

import pkg from '../../package.json';
import { fetchAppVersion, getBuildVersion } from './app-version';

describe('app-version', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('exposes the build version constant', () => {
		expect(getBuildVersion()).toBe(pkg.version);
	});

	it('prefers the API health version at runtime', async () => {
		(globalThis as { window: Window }).window = {
			location: {
				hostname: '127.0.0.1',
				port: '5173',
				origin: 'http://127.0.0.1:5173'
			}
		} as Window;

		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: true,
				json: async () => ({ ok: true, version: '2026.7.99' })
			}))
		);

		await expect(fetchAppVersion({ force: true })).resolves.toBe('2026.7.99');
		await expect(fetchAppVersion()).resolves.toBe('2026.7.99');
	});

	it('falls back to the build version when health is unavailable', async () => {
		(globalThis as { window: Window }).window = {
			location: {
				hostname: '127.0.0.1',
				port: '5173',
				origin: 'http://127.0.0.1:5173'
			}
		} as Window;

		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: false,
				json: async () => ({})
			}))
		);

		await expect(fetchAppVersion({ force: true })).resolves.toBe(getBuildVersion());
	});
});