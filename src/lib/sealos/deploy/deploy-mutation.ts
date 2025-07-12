"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { createDeploy, deleteDeploy } from "./deploy-old-api";
import type { DeployApiContext } from "./schemas/deploy-api-context-schemas";
import type { DeployCreateRequest } from "./schemas/req-res-schemas/req-res-create-schemas";
import type { DeployDeleteRequest } from "./schemas/req-res-schemas/req-res-delete-schemas";

export function useCreateDeployMutation(context: DeployApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DeployCreateRequest) =>
      runParallelAction(createDeploy(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "deploy", "list"] });
    },
  });
}

export function useDeleteDeployMutation(context: DeployApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DeployDeleteRequest) =>
      runParallelAction(deleteDeploy(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "deploy", "list"] });
    },
  });
}
