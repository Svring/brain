"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { createDevbox } from "../devbox-api/devbox-open-api";
import type { DevboxApiContext } from "../devbox-api/devbox-open-api-schemas";
import type {
  DevboxCreateRequest,
  DevboxCreateResponse,
  RuntimeName,
} from "../devbox-api/devbox-open-api-schemas";
import { toast } from "sonner";

interface CreateDevboxActionParams {
  name: string;
  runtimeName: RuntimeName;
}

/**
 * Hook that wraps useCreateDevboxMutation with default parameters
 * Automatically sets default resource values (CPU and memory)
 */
export function useCreateDevboxAction(context: DevboxApiContext) {
  const queryClient = useQueryClient();

  return useMutation<DevboxCreateResponse, unknown, CreateDevboxActionParams>({
    mutationFn: async ({ name, runtimeName }: CreateDevboxActionParams) => {
      // Create the request with default values
      const request: DevboxCreateRequest = {
        name,
        runtimeName,
        cpu: 2000, // Default from schema
        memory: 4096, // Default from schema
      };

      // Create the devbox
      const response = await runParallelAction(createDevbox(request, context));
      return response;
    },
    onSuccess: (data, { name, runtimeName }) => {
      toast.success(
        `Devbox "${name}" with ${runtimeName} runtime created successfully`
      );
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["devbox"],
      });
    },
    onError: (error, { name, runtimeName }) => {
      console.error(
        `Failed to create devbox "${name}" with ${runtimeName} runtime:`,
        error
      );
      toast.error(`Failed to create devbox "${name}"`);
      throw error;
    },
  });
}
