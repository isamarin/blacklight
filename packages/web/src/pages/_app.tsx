import "@/styles/globals.css";

import { createTRPCReact } from '@trpc/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { createWSClient, wsLink } from '@trpc/client';
import AppRouter from '@greenlight/platform/dist/trpc.js'

import Authentication from "../components/authentication";

export const trpcReact = createTRPCReact<typeof AppRouter>();

export default function App({ Component, pageProps }: AppProps) {
  const [wsConfig, setWsConfig] = useState({
    port: 5050,
    host: 'localhost',
    protocol: 'ws',
  });

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient, setTrpcClient] = useState(() =>
    trpcReact.createClient({
      links: [wsLink({
          client: createWSClient({
            url: createWebsocketUrl(),
          }),
        })
      ]
    })
  );

  function createWebsocketUrl() {
    let wsPort = 5050
    let wsHost = 'localhost'
    let wsProtocol = 'ws'

    if (typeof window !== "undefined") {
      wsPort = Number(localStorage.getItem('ws_port')) || 5050
      wsHost = localStorage.getItem('ws_host') || 'localhost'
      wsProtocol = localStorage.getItem('ws_protocol') || 'ws'
    }
    return `${wsProtocol}://${wsHost}:${wsPort}`;
  }

  return <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
    <Authentication>
      <Component {...pageProps} />
    </Authentication>
    </trpcReact.Provider>;
}
