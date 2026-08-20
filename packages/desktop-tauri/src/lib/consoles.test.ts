import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.fn();
const mutateMock = vi.fn();

vi.mock('$lib/trpc', () => ({
	trpc: {
		smartglass_consoles_list: {
			query: (...args: unknown[]) => queryMock(...args)
		},
		smartglass_console_power_on: {
			mutate: (...args: unknown[]) => mutateMock(...args)
		}
	}
}));

import {
	ensureConsoleAwake,
	fetchConsoles,
	isConsoleReady,
	waitForConsolePowerOn,
	wakeConsole
} from './consoles';

const token = { uhs: 'user', token: 'web-token' };

describe('consoles helpers', () => {
	beforeEach(() => {
		queryMock.mockReset();
		mutateMock.mockReset();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('isConsoleReady is true for On and Connected', () => {
		expect(isConsoleReady({ id: 'c1', powerState: 'On' })).toBe(true);
		expect(isConsoleReady({ id: 'c1', powerState: 'on' })).toBe(true);
		expect(isConsoleReady({ id: 'c1', powerState: 'Connected' })).toBe(true);
		expect(isConsoleReady({ id: 'c1', powerState: 'ConnectedStandby' })).toBe(false);
		expect(isConsoleReady(undefined)).toBe(false);
	});

	it('fetchConsoles returns smartglass results', async () => {
		queryMock.mockResolvedValueOnce({
			data: { result: [{ id: 'c1', powerState: 'On' }] }
		});

		await expect(fetchConsoles(token)).resolves.toEqual([
			{ id: 'c1', powerState: 'On' }
		]);
	});

	it('wakeConsole bursts smartglass power on', async () => {
		vi.useFakeTimers();
		mutateMock.mockResolvedValue({ ok: true });
		const pending = wakeConsole(token, 'c1');
		await vi.runAllTimersAsync();
		await pending;
		expect(mutateMock).toHaveBeenCalledTimes(3);
		expect(mutateMock).toHaveBeenCalledWith({ ...token, consoleId: 'c1' });
	});

	it('ensureConsoleAwake skips wake when console is already on', async () => {
		queryMock.mockResolvedValueOnce({
			data: { result: [{ id: 'c1', powerState: 'On' }] }
		});

		await ensureConsoleAwake(token, 'c1');
		expect(mutateMock).not.toHaveBeenCalled();
	});

	it('ensureConsoleAwake wakes and polls until console is on', async () => {
		queryMock
			.mockResolvedValueOnce({
				data: { result: [{ id: 'c1', powerState: 'ConnectedStandby' }] }
			})
			.mockResolvedValueOnce({
				data: { result: [{ id: 'c1', powerState: 'On' }] }
			});
		mutateMock.mockResolvedValue({ ok: true });

		vi.useFakeTimers();
		const pending = ensureConsoleAwake(token, 'c1');
		await vi.runAllTimersAsync();
		await pending;

		expect(mutateMock.mock.calls.length).toBeGreaterThanOrEqual(3);
	});

	it('waitForConsolePowerOn throws on timeout', async () => {
		queryMock.mockResolvedValue({
			data: { result: [{ id: 'c1', powerState: 'ConnectedStandby' }] }
		});

		vi.useFakeTimers();
		const pending = waitForConsolePowerOn(token, 'c1', 6_000);
		const assertion = expect(pending).rejects.toThrow('Console wake timed out');
		await vi.advanceTimersByTimeAsync(9_000);
		await assertion;
	});
});