"use client";

import { useQueries } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// type TargetWithMeta = {
//   target: CustomResourceTarget | BuiltinResourceTarget;
//   kind: string;
//   name: string;
// };

export const useResourceStatuses = (targets: ResourceTarget[]) => {
  const { devbox, cluster, objectstorage, launchpad } = useTRPCClients();

  const queryResults = useQueries({
    queries: targets.map((target) => {
      if (!target || !(target as any).name) {
        return {
          queryKey: ["resource", "invalid", target],
          queryFn: async () => undefined as any,
          enabled: false,
        };
      }

      if (target.type === "custom") {
        switch (target.resourceType) {
          case "devbox":
            return devbox.get.queryOptions(target);
          case "cluster":
            return cluster.get.queryOptions(target);
          case "objectstoragebucket":
            return objectstorage.get.queryOptions(target);
          default:
            return {
              queryKey: [
                "resource",
                "unsupported-custom",
                target.resourceType,
                target.name,
              ],
              queryFn: async () => {
                throw new Error(
                  `Unsupported custom resource type: ${target.resourceType}`
                );
              },
              enabled: false,
            };
        }
      }

      if (target.type === "builtin") {
        return launchpad.get.queryOptions(target);
      }

      return {
        queryKey: [
          "resource",
          "unsupported-type",
          (target as any).type,
          (target as any).name,
        ],
        queryFn: async () => {
          throw new Error(`Unsupported target type: ${(target as any).type}`);
        },
        enabled: false,
      };
    }),
  });

  return queryResults.map((query, index) => {
    const { resourceType, name } = targets[index] || ({} as ResourceTarget);
    const resource: any = (query as any).data;
    return {
      ...query,
      resource,
      originalResource: resource,
      status: resource?.status,
      resourceType,
      name,
      target: targets[index],
    } as any;
  });
};
