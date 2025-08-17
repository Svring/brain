// In Next.js, this file would be called: app/providers.tsx
"use client";

// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { activateContextCookies } from "@/lib/auth/auth-utils";

import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { DevboxRouter } from "@/lib/trpc/routers/devbox-router";
import { useState } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // Reduced from 60s to 5s
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export const devboxClient = createTRPCReact<DevboxRouter>();

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }

  const [devboxTrpcClient] = useState(() =>
    devboxClient.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc/devbox",
          headers: () => ({
            authorization: auth.kubeconfig,
            baseurl: auth.regionUrl,
          }),
        }),
      ],
    })
  );

  // activateContextCookies();

  return (
    <QueryClientProvider client={queryClient}>
      <devboxClient.Provider
        client={devboxTrpcClient}
        queryClient={queryClient}
      >
        {children}
      </devboxClient.Provider>
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
    </QueryClientProvider>
  );
}
