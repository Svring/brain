import { useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "./use-trpc-clients";
import { useMemo } from "react";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";

/**
 * Hook to invalidate project resources queries
 * This will trigger a refetch of all resources for a specific project
 */
export function useInvalidateProjectResources() {
  const queryClient = useQueryClient();
  const { k8s } = useTRPCClients();

  const invalidateProjectResources = (projectName: string) => {
    const labelSelector = `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${projectName}`;

    // Invalidate the specific project's resources query
    queryClient.invalidateQueries({
      // queryKey: k8s.listAllResources.queryKey({
      //   labelSelector,
      //   builtinResourceTypes: [
      //     "deployment",
      //     "statefulset",
      //     // "service",
      //     // "configmap",
      //     // "job",
      //     // "cronjob",
      //     // "pvc",
      //   ],
      //   customResourceTypes: ["devbox", "cluster", "objectstoragebucket"],
      // }),
      queryKey: k8s.pathKey(),
    });
  };

  const invalidateAllProjectResources = () => {
    // Invalidate all k8s.listAllResources queries
    queryClient.invalidateQueries({
      queryKey: ["k8s", "listAllResources"],
    });
  };

  const refetchProjectResources = async (projectName: string) => {
    const labelSelector = `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${projectName}`;

    // Force refetch the specific project's resources
    await queryClient.refetchQueries({
      queryKey: k8s.listAllResources.queryKey({
        labelSelector,
        builtinResourceTypes: ["deployment", "statefulset"],
        customResourceTypes: ["devbox", "cluster", "objectstoragebucket"],
      }),
    });
  };

  return {
    invalidateProjectResources,
    invalidateAllProjectResources,
    refetchProjectResources,
  };
}
