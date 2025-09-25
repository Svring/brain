"use client";

import { createTRPCContext } from "@trpc/tanstack-react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { DevboxRouter } from "@/lib/trpc/sealos/devbox/devbox-trpc-router";
import type { ClusterRouter } from "@/lib/trpc/sealos/cluster/cluster-trpc-router";
import type { LaunchpadRouter } from "@/lib/trpc/sealos/launchpad/launchpad-trpc-router";
import type { ObjectStorageRouter } from "@/lib/trpc/sealos/objectstorage/objectstorage-trpc-router";
import type { ProjectRouter } from "@/lib/trpc/brain/project/project-trpc-router";
import type { K8sRouter } from "@/lib/trpc/k8s/k8s-trpc-router";
import type { LanggraphRouter } from "@/lib/trpc/langgraph/langgraph-trpc-router";
import type { CostCenterRouter } from "@/lib/trpc/sealos/cost-center/cost-center-trpc-router";
import { useState } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { QueryClient } from "@tanstack/react-query";

export const devboxClient = createTRPCContext<DevboxRouter>();
export const clusterClient = createTRPCContext<ClusterRouter>();
export const launchpadClient = createTRPCContext<LaunchpadRouter>();
export const objectStorageClient = createTRPCContext<ObjectStorageRouter>();
export const projectClient = createTRPCContext<ProjectRouter>();
export const k8sClient = createTRPCContext<K8sRouter>();
export const langgraphClient = createTRPCContext<LanggraphRouter>();
export const costCenterClient = createTRPCContext<CostCenterRouter>();

// Raw TRPC clients for direct API calls
export const createRawDevboxClient = (auth: any) =>
  createTRPCClient<DevboxRouter>({
    links: [
      httpBatchLink({
        url: "/api/trpc/devbox",
        maxURLLength: 4000,
        headers: () => ({
          namespace: auth.namespace,
          kubeconfig: auth.kubeconfig,
          regionUrl: auth.regionUrl,
        }),
      }),
    ],
  });

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
          maxURLLength: 4000,
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
          maxURLLength: 6000,
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
          maxURLLength: 6000,
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
          maxURLLength: 6000,
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
          maxURLLength: 6000,
          headers: () => ({
            namespace: auth.namespace,
            kubeconfig: auth.kubeconfig,
            regionUrl: auth.regionUrl,
          }),
        }),
      ],
    })
  );

  const [objectStorageTrpcClient] = useState(() =>
    createTRPCClient<ObjectStorageRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc/objectstorage",
          maxURLLength: 6000,
          headers: () => ({
            namespace: auth.namespace,
            kubeconfig: auth.kubeconfig,
            regionUrl: auth.regionUrl,
          }),
        }),
      ],
    })
  );

  const [langgraphTrpcClient] = useState(() =>
    createTRPCClient<LanggraphRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc/langgraph",
          maxURLLength: 6000,
        }),
      ],
    })
  );

  const [costCenterTrpcClient] = useState(() =>
    createTRPCClient<CostCenterRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc/cost-center",
          maxURLLength: 6000,
          headers: () => {
            console.log("=== tRPC Provider Headers Debug ===");
            console.log("Auth kubeconfig:", auth.kubeconfig ? `${auth.kubeconfig.substring(0, 50)}...` : 'undefined');
            console.log("Auth appToken:", auth.appToken || 'undefined');
            console.log("=== End tRPC Provider Headers Debug ===");
            
            return {
              authorization: auth.kubeconfig,
              "x-app-token": auth.appToken,
            };
          },
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
          <objectStorageClient.TRPCProvider
            trpcClient={objectStorageTrpcClient}
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
                <langgraphClient.TRPCProvider
                  trpcClient={langgraphTrpcClient}
                  queryClient={queryClient}
                >
                  <costCenterClient.TRPCProvider
                    trpcClient={costCenterTrpcClient}
                    queryClient={queryClient}
                  >
                    {children}
                  </costCenterClient.TRPCProvider>
                </langgraphClient.TRPCProvider>
              </k8sClient.TRPCProvider>
            </projectClient.TRPCProvider>
          </objectStorageClient.TRPCProvider>
        </launchpadClient.TRPCProvider>
      </clusterClient.TRPCProvider>
    </devboxClient.TRPCProvider>
  );
}
