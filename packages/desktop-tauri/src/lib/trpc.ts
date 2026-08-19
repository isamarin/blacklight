import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { getTrpcHttpUrl } from '$lib/runtime';

type TrpcProcedure = {
	query: (...args: any[]) => Promise<any>
	mutate: (...args: any[]) => Promise<any>
}

function createTrpcClient() {
	return createTRPCProxyClient({
		links: [
			httpBatchLink({
				url: getTrpcHttpUrl(),
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