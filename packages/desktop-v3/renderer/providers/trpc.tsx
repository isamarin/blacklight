import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { httpBatchLink, createTRPCClient, TRPCClientError } from '@trpc/client';
import { useState, ReactNode } from 'react';
import { TRPCProvider } from '../utils/trpc';
import { appRouter } from '@blacklight/platform';
import { getTrpcHttpUrl } from '../utils/runtime';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 5,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        const message = getTrpcErrorMessage(error);
        console.log("Query Error:", message);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        const message = getTrpcErrorMessage(error);
        console.log("Mutation Error:", message);
      },
    }),
  });
}

function getTrpcErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred.";
}

function getQueryClient() {
    return makeQueryClient();
}

export const TrpcProviderComponent = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<typeof appRouter>({
      links: [
        httpBatchLink({
          url: getTrpcHttpUrl(),
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}