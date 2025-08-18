"use client";

import { createTRPCContext } from "@trpc/tanstack-react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { DevboxRouter } from "@/lib/trpc/sealos/devbox/devbox-router";
import type { ClusterRouter } from "@/lib/trpc/sealos/cluster/cluster-router";
import type { LaunchpadRouter } from "@/lib/trpc/sealos/launchpad/launchpad-router";
import type { ProjectRouter } from "@/lib/trpc/brain/project/project-router";
import type { K8sRouter } from "@/lib/trpc/k8s/k8s-router";
import { useState } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { QueryClient } from "@tanstack/react-query";

export const devboxClient = createTRPCContext<DevboxRouter>();
export const clusterClient = createTRPCContext<ClusterRouter>();
export const launchpadClient = createTRPCContext<LaunchpadRouter>();
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

  const [clusterTrpcClient] = useState(() =>
    createTRPCClient<ClusterRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc/cluster",
          headers: () => ({
            namespace: auth.namespace,
            kubeconfig: auth.kubeconfig,
            regionUrl: auth.regionUrl,
          }),
        }),
      ],
    })
  );

  const [launchpadTrpcClient] = useState(() =>
    createTRPCClient<LaunchpadRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc/launchpad",
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
      <clusterClient.TRPCProvider
        trpcClient={clusterTrpcClient}
        queryClient={queryClient}
      >
        <launchpadClient.TRPCProvider
          trpcClient={launchpadTrpcClient}
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
        </launchpadClient.TRPCProvider>
      </clusterClient.TRPCProvider>
    </devboxClient.TRPCProvider>
  );
}
