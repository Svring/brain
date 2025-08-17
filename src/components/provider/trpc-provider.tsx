"use client";

import { createTRPCContext } from "@trpc/tanstack-react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { DevboxRouter } from "@/lib/trpc/routers/devbox-router";
import { useState } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { QueryClient } from "@tanstack/react-query";

export const devboxClient = createTRPCContext<DevboxRouter>();

interface TRPCProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export default function TRPCProvider({
  children,
  queryClient,
}: TRPCProviderProps) {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }

  const [devboxTrpcClient] = useState(() =>
    createTRPCClient<DevboxRouter>({
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

  return (
    <devboxClient.TRPCProvider
      trpcClient={devboxTrpcClient}
      queryClient={queryClient}
    >
      {children}
    </devboxClient.TRPCProvider>
  );
}
