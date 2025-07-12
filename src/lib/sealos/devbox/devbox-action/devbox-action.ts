"use client";

import {
  useCreateDevboxMutation,
  useDeleteDevboxMutation,
} from "../devbox-method/devbox-mutation";
import { createDevboxContext, generateDevboxName } from "../devbox-utils";
import { DevboxCreateRequest } from "../schemas";

export function createDevboxAction(request: Partial<DevboxCreateRequest>) {
  const devboxContext = createDevboxContext();

  const mutation = useCreateDevboxMutation(devboxContext);

  return mutation.mutate({
    name: request.name ?? generateDevboxName(),
    runtimeName: request.runtimeName ?? "Debian",
    cpu: request.cpu ?? 2000,
    memory: request.memory ?? 4096,
  });
}

/**
 * Delete a devbox by name using the authenticated user's context.
 * Usage: deleteDevboxAction(devboxName)
 */
export function deleteDevboxAction(devboxName: string) {
  const devboxContext = createDevboxContext();

  const mutation = useDeleteDevboxMutation(devboxContext);

  return mutation.mutate(devboxName);
}
