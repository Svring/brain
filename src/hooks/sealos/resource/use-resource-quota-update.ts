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

  // Get the appropriate mutation based on resource type
  const getUpdateMutation = () => {
    if (target.type === "builtin") {
      // Handle builtin resources
      switch (target.resourceType) {
        case "deployment":
          return useMutation(launchpad.updateLaunchpad.mutationOptions());
        case "statefulset":
          return useMutation(launchpad.updateLaunchpad.mutationOptions());
        default:
          throw new Error(
            `Unsupported builtin resource type: ${target.resourceType}`
          );
      }
    } else if (target.type === "custom") {
      return useMutation(launchpad.updateLaunchpad.mutationOptions());
    } else {
      throw new Error(`Unsupported target type: ${(target as any).type}`);
    }
  };

  const mutation = getUpdateMutation();

  // Enhanced mutation with target context
  const updateResourceQuota = async (quotaData: any) => {
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
