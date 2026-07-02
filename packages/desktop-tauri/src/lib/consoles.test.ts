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

	it('isConsoleReady is true only for On', () => {
		expect(isConsoleReady({ id: 'c1', powerState: 'On' })).toBe(true);
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

	it('wakeConsole calls smartglass power on mutation', async () => {
		mutateMock.mockResolvedValueOnce({ ok: true });
		await wakeConsole(token, 'c1');
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
		mutateMock.mockResolvedValueOnce({ ok: true });

		vi.useFakeTimers();
		const pending = ensureConsoleAwake(token, 'c1');
		await vi.advanceTimersByTimeAsync(3_000);
		await pending;

		expect(mutateMock).toHaveBeenCalledOnce();
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