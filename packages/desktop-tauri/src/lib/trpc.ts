import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { getTrpcHttpUrl } from '$lib/runtime';
import { desktopApiFetch } from '$lib/tauri';
import type { BlacklightRouter } from '$lib/trpc.types';

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
	}) as unknown as BlacklightRouter;
}

let client = createTrpcClient();

export function getTrpcClient() {
	return client;
}

export function resetTrpcClient() {
	client = createTrpcClient();
}

/**
 * The client is rebuilt when the API port changes, so callers hold this proxy
 * rather than a client instance.
 */
export const trpc = new Proxy({} as BlacklightRouter, {
	get(_target, prop) {
		const current = getTrpcClient();
		return Reflect.get(current, prop, current);
	}
});

export type { BlacklightRouter, RouterOutputs } from '$lib/trpc.types';