import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { getTrpcHttpUrl } from '$lib/runtime';
import { desktopApiFetch } from '$lib/tauri';

type TrpcProcedure = {
	query: (...args: any[]) => Promise<any>
	mutate: (...args: any[]) => Promise<any>
}

function createTrpcClient() {
	return createTRPCProxyClient({
		links: [
			httpBatchLink({
				url: getTrpcHttpUrl(),
				fetch: desktopApiFetch,
				/*
				 * Every procedure input carries the full Xbox JWT, so a batched GET
				 * (e.g. 23 × gamepass_resolve_productid when the catalog loads) built
				 * a URL long enough for the sidecar to answer 431 with an empty body —
				 * surfacing as "Unexpected end of JSON input" and blank game art.
				 * POST moves the inputs into the request body; maxURLLength still caps
				 * any GET that slips through.
				 */
				methodOverride: 'POST',
				maxURLLength: 2000,
				headers() {
					return {};
				}
			})
		]
	}) as unknown as Record<string, TrpcProcedure>;
}

let client = createTrpcClient();

export function getTrpcClient() {
	return client;
}

export function resetTrpcClient() {
	client = createTrpcClient();
}

type TrpcClient = ReturnType<typeof createTrpcClient>;

export const trpc = new Proxy({} as TrpcClient, {
	get(_target, prop) {
		const current = getTrpcClient();
		return Reflect.get(current, prop, current);
	}
});

// Platform git-prepare cannot emit portable tRPC declaration types.
export type RouterOutputs = Record<string, any>;