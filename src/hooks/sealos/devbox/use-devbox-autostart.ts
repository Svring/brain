"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface UseDevboxAutostartOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useDevboxAutostart = (options: UseDevboxAutostartOptions = {}) => {
  const { onSuccess, onError } = options;
  const { devbox } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();

  const autostartMutation = useMutation({
    ...devbox.autostart.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Devbox autostart enabled successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target),
        devbox.releases.queryKey(target.name),
      ]);
    },
    onError: (error: any) => {
      console.error("Devbox autostart error:", error);
      const message = error.message || "Failed to enable devbox autostart";
      toast.error(message);
      onError?.(message);
    },
  });

  const executeAutostart = async (devboxName: string) => {
    try {
      const target = convertResourceTypeToTarget(
        "devbox",
        devboxName
      ) as CustomResourceTarget;

      await autostartMutation.mutateAsync(target);
    } catch (error) {
      console.error("Failed to enable devbox autostart:", error);
    }
  };

  return {
    executeAutostart,
    autostartMutation,
    isPending: autostartMutation.isPending,
  };
};
