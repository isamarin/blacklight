import { trpc } from '$lib/trpc';

type WebToken = {
	uhs: string;
	token: string;
};

export type ConsoleInfo = {
	id: string;
	name?: string;
	powerState?: string;
	remoteManagementEnabled?: boolean;
	consoleStreamingEnabled?: boolean;
};

const WAKE_POLL_INTERVAL_MS = 3_000;
const WAKE_TIMEOUT_MS = 120_000;
const WAKE_BURST = 3;
const WAKE_BURST_GAP_MS = 800;
const WAKE_REPEAT_EVERY_MS = 12_000;

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hasWebToken(token: WebToken | null | undefined): token is WebToken {
	return Boolean(token?.uhs?.trim() && token.token.trim());
}

export async function fetchConsoles(token: WebToken): Promise<ConsoleInfo[]> {
	const data = await trpc.smartglass_consoles_list.query(token);
	return (data?.data?.result as ConsoleInfo[]) || [];
}

export function isConsoleReady(consoleInfo: ConsoleInfo | undefined): boolean {
	const state = (consoleInfo?.powerState ?? '').trim().toLowerCase();
	return state === 'on' || state === 'connected';
}

export function isConsoleWakeTimeout(error: unknown): boolean {
	return error instanceof Error && error.message === 'Console wake timed out';
}

export async function wakeConsole(token: WebToken, consoleId: string): Promise<void> {
	if (!hasWebToken(token)) {
		throw new Error('web token missing');
	}

	let lastError: unknown;
	let sent = false;

	for (let attempt = 0; attempt < WAKE_BURST; attempt++) {
		try {
			await trpc.smartglass_console_power_on.mutate({ ...token, consoleId });
			sent = true;
		} catch (error) {
			lastError = error;
		}
		if (attempt < WAKE_BURST - 1) {
			await sleep(WAKE_BURST_GAP_MS);
		}
	}

	if (!sent && lastError) {
		throw lastError;
	}
}

export async function waitForConsolePowerOn(
	token: WebToken,
	consoleId: string,
	timeoutMs = WAKE_TIMEOUT_MS
): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	let lastWake = Date.now();

	while (Date.now() < deadline) {
		await sleep(WAKE_POLL_INTERVAL_MS);
		const consoles = await fetchConsoles(token);
		const consoleInfo = consoles.find((item) => item.id === consoleId);
		if (isConsoleReady(consoleInfo)) {
			return;
		}
		if (Date.now() - lastWake >= WAKE_REPEAT_EVERY_MS) {
			lastWake = Date.now();
			await wakeConsole(token, consoleId).catch(() => undefined);
		}
	}

	throw new Error('Console wake timed out');
}

export async function ensureConsoleAwake(token: WebToken, consoleId: string): Promise<void> {
	if (!hasWebToken(token)) {
		throw new Error('web token missing');
	}

	const consoles = await fetchConsoles(token);
	const consoleInfo = consoles.find((item) => item.id === consoleId);

	if (isConsoleReady(consoleInfo)) {
		return;
	}

	await wakeConsole(token, consoleId);
	await waitForConsolePowerOn(token, consoleId);
}