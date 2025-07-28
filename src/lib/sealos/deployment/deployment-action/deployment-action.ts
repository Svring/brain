"use client";

import { useMutation } from "@tanstack/react-query";
import { useCreateDeployMutation } from "../deployment-method/deployment-mutation";
import { generateDeployName } from "../deploy-utils";
import type { DeployApiContext } from "../schemas/deploy-api-context-schemas";
import type { DeployCreateRequest } from "../schemas/req-res-schemas/req-res-create-schemas";

// Partial request types for easier usage
export type PartialDeployCreateRequest = {
  image: string; // Required field
  ports?: Array<{ number: number; publicAccess: boolean }>;
  name?: string;
  env?: Record<string, string>;
};

/**
 * Custom hook for creating deployments with default values
 */
export function useCreateDeployAction(context: DeployApiContext) {
  const baseMutation = useCreateDeployMutation(context);

  return useMutation({
    mutationFn: async (partialRequest: PartialDeployCreateRequest) => {
      // Apply defaults to the partial request
      const fullRequest: DeployCreateRequest = {
        name: partialRequest.name || generateDeployName(),
        image: partialRequest.image,
        env: partialRequest.env || {},
        ports: partialRequest.ports || [{ number: 80, publicAccess: true }],
      };

      // Use the base mutation function
      return baseMutation.mutateAsync(fullRequest);
    },
  });
}
