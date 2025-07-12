"use client";

import { createDeployContext, generateDeployName } from "../deploy-utils";
import type { DeployCreateRequest } from "../schemas/req-res-schemas/req-res-create-schemas";
import {
  useCreateDeployMutation,
  useDeleteDeployMutation,
} from "../deploy-mutation";

/**
 * Create a deploy using the authenticated user's context.
 * Usage: createDeployAction({ ... })
 */
export function createDeployAction(request: Partial<DeployCreateRequest>) {
  const deployContext = createDeployContext();
  const mutation = useCreateDeployMutation(deployContext);

  // Provide sensible defaults for deploy creation
  const defaultRequest: DeployCreateRequest = {
    name: request.name ?? generateDeployName(),
    image: request.image ?? "nginx:latest",
    env: request.env ?? {},
    ports: request.ports ?? [{ number: 80, publicAccess: false }],
    ...request,
  };

  return mutation.mutate(defaultRequest);
}

/**
 * Delete a deploy by name using the authenticated user's context.
 * Usage: deleteDeployAction(deployName)
 */
export function deleteDeployAction(deployName: string) {
  const deployContext = createDeployContext();
  const mutation = useDeleteDeployMutation(deployContext);
  return mutation.mutate({ name: deployName });
}
