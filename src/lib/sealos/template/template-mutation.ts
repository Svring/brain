"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import type { InstanceApiContext } from "./schemas/template-api-context-schemas";
import type { CreateInstanceRequest } from "./schemas/template-create-instance-schemas";
import { createInstance } from "./template-old-api";

export function useCreateInstanceMutation(context: InstanceApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateInstanceRequest) =>
      runParallelAction(createInstance(request, context)),
    onSuccess: () => {
      // Invalidate project-related queries since creating an instance creates project resources
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["sealos", "projects"] });
    },
  });
}
