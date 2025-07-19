"use client";

import { useMutation } from "@tanstack/react-query";
import { useCreateObjectStorageMutation } from "../objectstorage-method/objectstorage-mutation";
import { generateObjectStorageName } from "../objectstorage-utils";
import type { ObjectStorageApiContext } from "../schemas/objectstorage-api-context-schemas";
import type { ObjectStorageCreateRequest } from "../schemas/req-res-schemas/req-res-create-schemas";

// Partial request types for easier usage
export type PartialObjectStorageCreateRequest = {
  bucketName?: string;
  bucketPolicy?: "private" | "publicRead" | "publicReadWrite";
};

/**
 * Custom hook for creating object storage with default values
 */
export function useCreateObjectStorageAction(context: ObjectStorageApiContext) {
  const baseMutation = useCreateObjectStorageMutation(context);

  return useMutation({
    mutationFn: async (
      partialRequest: PartialObjectStorageCreateRequest = {}
    ) => {
      // Apply defaults to the partial request
      const fullRequest: ObjectStorageCreateRequest = {
        bucketName: partialRequest.bucketName || generateObjectStorageName(),
        bucketPolicy: partialRequest.bucketPolicy || "private",
      };

      // Use the base mutation function
      return baseMutation.mutateAsync(fullRequest);
    },
  });
}
