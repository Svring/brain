"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { convertSimplePortOpsToFormPorts } from "@/lib/copilot/sealos/devbox/copilot-devbox-utils";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";

interface UseDevboxUpdateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  existingPorts?: any[];
}

export const useDevboxUpdate = ({
  onSuccess,
  onError,
  existingPorts = [],
}: UseDevboxUpdateOptions = {}) => {
  const { devbox } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();

  const mutation = useMutation({
    ...devbox.update.mutationOptions(),
    onSuccess: (data, { devboxName }) => {
      toast.success("Devbox updated successfully!");
      onSuccess?.(data);
      const target = convertResourceTypeToTarget("devbox", devboxName);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target as any),
      ]);
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
    const requestData = { ...data };
    if (data.simplePorts?.length) {
      requestData.ports = convertSimplePortOpsToFormPorts(
        existingPorts,
        data.simplePorts
      );
      delete requestData.simplePorts;
    }

    await mutation.mutateAsync({ devboxName, request: requestData });
  };

  return {
    updateDevbox,
    isLoading: mutation.isPending,
  };
};
