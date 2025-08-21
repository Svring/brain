import { useIsMutating } from "@tanstack/react-query";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface UseResourceDeleteOptions {
  status?: string;
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export function useResourceDelete({
  status,
  target,
}: UseResourceDeleteOptions) {
  const isDeleting =
    status === "Deleting" ||
    status === "Terminating" ||
    useIsMutating({
      predicate: (mutation) => {
        const isDeleteMutation =
          mutation.options.mutationFn
            ?.toString()
            .includes(
              `delete${
                target.resourceType.charAt(0).toUpperCase() +
                target.resourceType.slice(1)
              }`
            ) ?? false;
        const variables = mutation.state.variables as any;
        return isDeleteMutation && variables?.name === target.name;
      },
    }) > 0;

  return {
    isDeleting,
  };
}
