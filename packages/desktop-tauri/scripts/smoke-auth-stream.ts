import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from '@trpc/client';
import { appRouter } from '@blacklight/platform';

const API_ORIGIN = process.env.BLACKLIGHT_API_ORIGIN ?? 'http://127.0.0.1:9003';
const API_URL = `${API_ORIGIN}/trpc`;
const AUTH_TIMEOUT_MS = Number(process.env.SMOKE_AUTH_TIMEOUT_MS ?? 45_000);

const trpc = createTRPCProxyClient<typeof appRouter>({
	links: [
		httpBatchLink({
			url: API_URL
		})
	]
});

function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

async function step(name: string, fn: () => Promise<void>) {
	process.stdout.write(`[smoke:api] ${name}... `);
	try {
		await fn();
		console.log('OK');
	} catch (error) {
		console.log('FAIL');
		throw error;
	}
}

function isTrpcError(error: unknown): error is TRPCClientError<typeof appRouter> {
	return error instanceof TRPCClientError;
}

async function expectTrpcCode(
	fn: () => Promise<unknown>,
	code: string,
	label: string
): Promise<void> {
	try {
		await fn();
		throw new Error(`${label}: expected TRPC error ${code}`);
	} catch (error) {
		if (error instanceof Error && error.message.includes('expected TRPC error')) {
			throw error;
		}
		assert(isTrpcError(error), `${label}: expected TRPCClientError, got ${String(error)}`);
		assert(error.data?.code === code, `${label}: expected ${code}, got ${error.data?.code}`);
	}
}

const emptyStreamConfig = {
	id: 'smoke-title',
	type: 'cloud' as const,
	language: 'en-US',
	host: 'https://uks.core.gssv-play-prod.xboxlive.com',
	resolution: 1080 as const
};

const emptyToken = {
	token: '',
	market: 'US',
	language: 'en-US'
};

async function main() {
	console.log(`[smoke:api] target ${API_URL}`);

	await step('health', async () => {
		const response = await fetch(`${API_ORIGIN}/health`);
		assert(response.ok, `health status ${response.status}`);
		const body = (await response.json()) as { ok?: boolean; service?: string };
		assert(body.ok === true, 'health body missing ok:true');
		assert(body.service === 'blacklight-api', 'unexpected health service name');
	});

	await step('tRPC ping', async () => {
		const pong = await trpc.ping.query();
		assert(pong === 'pong', `unexpected ping response: ${pong}`);
	});

	await step('tRPC version', async () => {
		const version = await trpc.version.query();
		assert(typeof version === 'string' && version.length > 0, 'version is empty');
	});

	await step('auth_msal_start (live Microsoft device code)', async () => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

		try {
			const flow = await Promise.race([
				trpc.auth_msal_start.query(undefined),
				new Promise<never>((_, reject) => {
					controller.signal.addEventListener('abort', () => {
						reject(new Error(`auth_msal_start timed out after ${AUTH_TIMEOUT_MS}ms`));
					});
				})
			]);

			assert(
				typeof flow === 'object' && flow !== null && 'user_code' in flow,
				'auth_msal_start did not return device code payload'
			);
		} finally {
			clearTimeout(timeout);
		}
	});

	await step('auth_msal_refresh rejects invalid token', async () => {
		try {
			await trpc.auth_msal_refresh.query({
				token_type: 'Bearer',
				scope: 'xboxlive.signin',
				expires_in: 0,
				ext_expires_in: 0,
				access_token: 'invalid-access-token',
				refresh_token: 'invalid-refresh-token',
				id_token: 'invalid-id-token'
			});
			throw new Error('auth_msal_refresh: expected failure with invalid token');
		} catch (error) {
			assert(error instanceof Error, 'auth_msal_refresh did not throw Error');
		}
	});

	await step('smartglass_consoles_list rejects missing token', async () => {
		await expectTrpcCode(
			() => trpc.smartglass_consoles_list.query({ uhs: '', token: '' }),
			'UNAUTHORIZED',
			'smartglass_consoles_list'
		);
	});

	await step('smartglass_console_power_on rejects missing token', async () => {
		await expectTrpcCode(
			() => trpc.smartglass_console_power_on.mutate({ uhs: '', token: '', consoleId: 'c1' }),
			'UNAUTHORIZED',
			'smartglass_console_power_on'
		);
	});

	await step('streaming_start_stream rejects missing streaming token', async () => {
		try {
			await trpc.streaming_start_stream.mutate({
				token: emptyToken,
				xCloudStreamConfig: emptyStreamConfig
			});
			throw new Error('streaming_start_stream: expected failure with empty token');
		} catch (error) {
			assert(error instanceof Error, 'streaming_start_stream did not throw Error');
		}
	});

	await step('streaming_send_chat_sdp_offer rejects missing streaming token', async () => {
		try {
			await trpc.streaming_send_chat_sdp_offer.mutate({
				token: emptyToken,
				xCloudStreamConfig: emptyStreamConfig,
				sessionPath: 'v5/sessions/cloud/smoke-session',
				sdpOffer: { type: 'offer', sdp: 'v=0' }
			});
			throw new Error('streaming_send_chat_sdp_offer: expected failure with empty token');
		} catch (error) {
			assert(error instanceof Error, 'streaming_send_chat_sdp_offer did not throw Error');
		}
	});

	await step('health after stream failures', async () => {
		const response = await fetch(`${API_ORIGIN}/health`);
		assert(response.ok, 'API unhealthy after stream smoke failures');
	});

	console.log('[smoke:api] all checks passed');
}

main().catch((error) => {
	console.error('[smoke:api] failed:', error);
	process.exit(1);
});