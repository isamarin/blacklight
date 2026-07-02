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
const WAKE_TIMEOUT_MS = 90_000;

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchConsoles(token: WebToken): Promise<ConsoleInfo[]> {
	const data = await trpc.smartglass_consoles_list.query(token);
	return (data?.data?.result as ConsoleInfo[]) || [];
}

export function isConsoleReady(consoleInfo: ConsoleInfo | undefined): boolean {
	return consoleInfo?.powerState === 'On';
}

export async function wakeConsole(token: WebToken, consoleId: string): Promise<void> {
	await trpc.smartglass_console_power_on.mutate({ ...token, consoleId });
}

export async function waitForConsolePowerOn(
	token: WebToken,
	consoleId: string,
	timeoutMs = WAKE_TIMEOUT_MS
): Promise<void> {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		await sleep(WAKE_POLL_INTERVAL_MS);
		const consoles = await fetchConsoles(token);
		const consoleInfo = consoles.find((item) => item.id === consoleId);
		if (isConsoleReady(consoleInfo)) {
			return;
		}
	}

	throw new Error('Console wake timed out');
}

export async function ensureConsoleAwake(token: WebToken, consoleId: string): Promise<void> {
	const consoles = await fetchConsoles(token);
	const consoleInfo = consoles.find((item) => item.id === consoleId);

	if (isConsoleReady(consoleInfo)) {
		return;
	}

	await wakeConsole(token, consoleId);
	await waitForConsolePowerOn(token, consoleId);
}