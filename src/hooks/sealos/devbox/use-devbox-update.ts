"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";

interface UseDevboxUpdateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  existingPorts?: any[]; // For converting simple port operations
}

export const useDevboxUpdate = (options: UseDevboxUpdateOptions = {}) => {
  const { onSuccess, onError, existingPorts = [] } = options;
  const { devbox } = useTRPCClients();

  const updateDevboxMutation = useMutation({
    ...devbox.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Devbox updated successfully!");
      onSuccess?.(data);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update devbox");
      onError?.(error);
    },
  });

  const updateDevbox = async (
    devboxName: string,
    data: DevboxUpdateFormData
  ) => {
    try {
      // If simple ports payload is provided, we need to convert it to regular ports format
      const requestData = { ...data };

      if (data.simplePorts && data.simplePorts.length > 0) {
        // Import the conversion function dynamically to avoid circular dependency
        const { convertSimplePortOpsToFormPorts } = await import(
          "@/lib/copilot/sealos/devbox/copilot-devbox-utils"
        );

        // Convert simple port operations to regular ports format
        requestData.ports = convertSimplePortOpsToFormPorts(
          existingPorts,
          data.simplePorts
        );

        // Remove the simple ports from the request
        delete requestData.simplePorts;
      }

      await updateDevboxMutation.mutateAsync({
        devboxName,
        request: requestData,
      });
    } catch (error) {
      console.error("Error updating devbox:", error);
    }
  };

  return {
    updateDevbox,
    isLoading: updateDevboxMutation.isPending,
  };
};
