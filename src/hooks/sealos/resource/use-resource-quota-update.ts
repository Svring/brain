import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useMutation } from "@tanstack/react-query";

/**
 * Hook that returns the appropriate update mutation for resource quota updates
 * Currently supports deployment and statefulset resources using launchpad router
 */
export const useResourceQuotaUpdate = (
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  const { launchpad } = useTRPCClients();

  // Always call useMutation at the top level
  const mutation = useMutation(launchpad.updateLaunchpad.mutationOptions());

  // Enhanced mutation with target context
  const updateResourceQuota = async (quotaData: Record<string, unknown>) => {
    if (!target.name) {
      throw new Error("Resource name is required for quota update");
    }

    const updateRequest = {
      name: target.name,
      request: {
        // Add quota-specific fields here based on your API schema
        ...quotaData,
      },
    };

    return await mutation.mutateAsync(updateRequest);
  };

  return {
    mutation,
    updateResourceQuota,
    isSupported: () => {
      const supportedTypes = ["deployment", "statefulset"];
      return supportedTypes.includes(target.resourceType);
    },
    target,
  };
};
