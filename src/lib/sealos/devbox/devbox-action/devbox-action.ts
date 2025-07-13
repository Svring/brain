"use client";

import { useMutation } from "@tanstack/react-query";
import { useCreateDevboxMutation } from "../devbox-method/devbox-mutation";
import { generateDevboxName } from "../devbox-utils";
import { DevboxApiContext, DevboxCreateRequest, RuntimeName } from "../schemas";

// Partial request types for easier usage
export type PartialDevboxCreateRequest = Partial<DevboxCreateRequest> & {
  runtimeName: RuntimeName; // Required field
};

/**
 * Custom hook for creating devboxes with default values
 */
export function useCreateDevboxAction(context: DevboxApiContext) {
  const baseMutation = useCreateDevboxMutation(context);

  return useMutation({
    mutationFn: async (partialRequest: PartialDevboxCreateRequest) => {
      // Apply defaults to the partial request
      const fullRequest: DevboxCreateRequest = {
        name: partialRequest.name || generateDevboxName(),
        cpu: partialRequest.cpu || 2000,
        memory: partialRequest.memory || 4096,
        ...partialRequest, // Allow overrides, including runtimeName
      };

      // Use the base mutation function
      return baseMutation.mutateAsync(fullRequest);
    },
  });
}
