import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { inferRouterOutputs } from '@trpc/server';
import { appRouter } from '@blacklight/platform';
import { getTrpcHttpUrl } from '$lib/runtime';

export const trpc = createTRPCProxyClient<typeof appRouter>({
	links: [
		httpBatchLink({
			url: getTrpcHttpUrl()
		})
	]
});

export type RouterOutputs = inferRouterOutputs<typeof appRouter>;