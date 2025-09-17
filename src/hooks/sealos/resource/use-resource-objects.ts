"use client";

import { useQueries } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getResourceQueryOptions } from "@/lib/sealos/resources/resource-utils";

export const useResourceObjects = (targets: ResourceTarget[]) => {
  const { devbox, cluster, objectstorage, launchpad } = useTRPCClients();

  const combinedQueries = useQueries({
    queries: targets.map((target) =>
      getResourceQueryOptions(target, {
        devbox,
        cluster,
        objectstorage,
        launchpad,
      })
    ),
    combine: (results) => {
      return {
        data: results.map((result) => {
          return (result as any).data;
        }),
        pending: results.some((result) => result.isPending),
        error: results.find((result) => result.error)?.error,
        isLoading: results.some((result) => result.isLoading),
      };
    },
  });

  return combinedQueries;
};
