"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { toast } from "sonner";

interface UseLaunchpadUpdateOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useLaunchpadUpdate = (options: UseLaunchpadUpdateOptions = {}) => {
  const { onSuccess, onError } = options;
  const { launchpad } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();

  const updateLaunchpadMutation = useMutation({
    ...launchpad.update.mutationOptions(),
    onSuccess: (_, variables) => {
      const message = `Launchpad "${variables.name}" updated successfully`;
      toast.success(message);
      onSuccess?.(message);

      // Invalidate relevant queries
      const target = convertResourceTypeToTarget("deployment", variables.name);
      invalidateQueries([
        launchpad.list.queryKey(),
        launchpad.get.queryKey(target as any),
      ]);
    },
    onError: (error: any, variables) => {
      const message =
        error.message || `Failed to update launchpad "${variables.name}"`;
      toast.error(message);
      onError?.(message);
    },
  });

  const updateLaunchpad = async (data: LaunchpadUpdateFormData) => {
    try {
      await updateLaunchpadMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error updating launchpad:", error);
    }
  };

  return {
    updateLaunchpad,
    isLoading: updateLaunchpadMutation.isPending,
  };
};
