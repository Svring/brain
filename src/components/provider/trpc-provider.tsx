"use client";

import { createTRPCContext } from "@trpc/tanstack-react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { DevboxRouter } from "@/lib/trpc/sealos/devbox/devbox-router";
import type { ProjectRouter } from "@/lib/trpc/brain/project/project-router";
import type { K8sRouter } from "@/lib/trpc/k8s/k8s-router";
import { useState } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { QueryClient } from "@tanstack/react-query";

export const devboxClient = createTRPCContext<DevboxRouter>();
export const projectClient = createTRPCContext<ProjectRouter>();
export const k8sClient = createTRPCContext<K8sRouter>();

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
            namespace: auth.namespace,
            kubeconfig: auth.kubeconfig,
            regionUrl: auth.regionUrl,
          }),
        }),
      ],
    })
  );

  const [projectTrpcClient] = useState(() =>
    createTRPCClient<ProjectRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc/project",
          headers: () => ({
            namespace: auth.namespace,
            kubeconfig: auth.kubeconfig,
            regionUrl: auth.regionUrl,
          }),
        }),
      ],
    })
  );

  const [k8sTrpcClient] = useState(() =>
    createTRPCClient<K8sRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc/k8s",
          headers: () => ({
            namespace: auth.namespace,
            kubeconfig: auth.kubeconfig,
            regionUrl: auth.regionUrl,
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
      <projectClient.TRPCProvider
        trpcClient={projectTrpcClient}
        queryClient={queryClient}
      >
        <k8sClient.TRPCProvider
          trpcClient={k8sTrpcClient}
          queryClient={queryClient}
        >
          {children}
        </k8sClient.TRPCProvider>
      </projectClient.TRPCProvider>
    </devboxClient.TRPCProvider>
  );
}
