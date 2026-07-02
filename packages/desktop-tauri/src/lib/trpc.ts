import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { inferRouterOutputs } from '@trpc/server';
import { appRouter } from '@blacklight/platform';
import { getTrpcHttpUrl } from '$lib/runtime';

function createTrpcClient() {
	return createTRPCProxyClient<typeof appRouter>({
		links: [
			httpBatchLink({
				url: getTrpcHttpUrl(),
				headers() {
					return {};
				}
			})
		]
	});
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

export type RouterOutputs = inferRouterOutputs<typeof appRouter>;