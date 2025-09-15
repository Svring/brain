"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";

interface UseDevboxUpdateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useDevboxUpdate = ({
  onSuccess,
  onError,
}: UseDevboxUpdateOptions = {}) => {
  const { devbox } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();

  const mutation = useMutation({
    ...devbox.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Devbox updated successfully!");
      onSuccess?.(data);
      const target = convertResourceTypeToTarget("devbox", data.name);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target),
        devbox.releases.queryKey(data.name),
      ]);
    },
    onError: (error: any) => {
      console.error("Devbox update error:", error);
      toast.error(error.message || "Failed to update devbox");
      onError?.(error);
    },
  });

  const updateDevbox = async (data: DevboxUpdateFormData) => {
    await mutation.mutateAsync(data);
  };

  return {
    updateDevbox,
    isLoading: mutation.isPending,
  };
};
