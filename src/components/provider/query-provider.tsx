// app/providers.tsx
"use client";

import {
  isServer,
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import TRPCProvider from "./trpc-provider";

function makeQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 20 * 1000, // Shorter stale time - 20 seconds
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
      },
    },
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        // Use the queryClient instance from the outer scope
        queryClient.invalidateQueries({
          queryKey: mutation.options.mutationKey,
        });
      },
    }),
  });

  return queryClient;
}

let browserQueryClient: QueryClient | undefined = undefined;

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

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient}>{children}</TRPCProvider>
      {/* <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
