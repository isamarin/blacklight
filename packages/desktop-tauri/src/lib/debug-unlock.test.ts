import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	_resetDebugUnlockForTests,
	getDebugUnlocked,
	registerVersionTap,
	unlockDebug
} from './debug-unlock';

describe('debug-unlock', () => {
	beforeEach(() => {
		const store = new Map<string, string>();
		vi.stubGlobal('sessionStorage', {
			getItem: (k: string) => store.get(k) ?? null,
			setItem: (k: string, v: string) => {
				store.set(k, v);
			},
			removeItem: (k: string) => {
				store.delete(k);
			}
		});
		_resetDebugUnlockForTests();
	});

	afterEach(() => {
		_resetDebugUnlockForTests();
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('stays locked until seven taps', () => {
		for (let i = 0; i < 6; i++) {
			expect(registerVersionTap()).toBe(false);
			expect(getDebugUnlocked()).toBe(false);
		}
		expect(registerVersionTap()).toBe(true);
		expect(getDebugUnlocked()).toBe(true);
	});

	it('resets the tap window after a pause', () => {
		vi.useFakeTimers();
		vi.setSystemTime(0);

		for (let i = 0; i < 5; i++) registerVersionTap();
		expect(getDebugUnlocked()).toBe(false);

		vi.setSystemTime(5000);
		for (let i = 0; i < 6; i++) {
			expect(registerVersionTap()).toBe(false);
		}
		expect(registerVersionTap()).toBe(true);
		expect(getDebugUnlocked()).toBe(true);
	});

	it('unlockDebug is idempotent and persists to sessionStorage', () => {
		unlockDebug();
		expect(getDebugUnlocked()).toBe(true);
		expect(sessionStorage.getItem('blacklight-debug-unlocked')).toBe('1');
		expect(registerVersionTap()).toBe(false);
	});
});
