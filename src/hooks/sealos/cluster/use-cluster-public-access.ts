import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface UseClusterPublicAccessOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useClusterPublicAccess = (
  target: CustomResourceTarget,
  options: UseClusterPublicAccessOptions = {}
) => {
  const { onSuccess, onError } = options;
  const { cluster } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();

  const enablePublicMutation = useMutation({
    ...cluster.enablePublic.mutationOptions(),
    onSuccess: (_, input) => {
      const message = "Public access enabled successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([cluster.get.queryKey(target)]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to enable public access";
      toast.error(message);
      onError?.(message);
    },
  });

  const disablePublicMutation = useMutation({
    ...cluster.disablePublic.mutationOptions(),
    onSuccess: (_, input) => {
      const message = "Public access disabled successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([cluster.get.queryKey(target)]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to disable public access";
      toast.error(message);
      onError?.(message);
    },
  });

  const enablePublic = async () => {
    try {
      await enablePublicMutation.mutateAsync({
        databaseName: target.name!,
      });
    } catch (error) {
      console.error("Failed to enable public access:", error);
    }
  };

  const disablePublic = async () => {
    try {
      await disablePublicMutation.mutateAsync({
        databaseName: target.name!,
      });
    } catch (error) {
      console.error("Failed to disable public access:", error);
    }
  };

  return {
    enablePublic,
    disablePublic,
    isEnabling: enablePublicMutation.isPending,
    isDisabling: disablePublicMutation.isPending,
    isPending:
      enablePublicMutation.isPending || disablePublicMutation.isPending,
  };
};
