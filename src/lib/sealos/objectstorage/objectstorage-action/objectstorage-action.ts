"use client";

import {
  createObjectStorageContext,
  generateObjectStorageName,
} from "../objectstorage-utils";
import type { ObjectStorageCreateRequest } from "../schemas/req-res-schemas/req-res-create-schemas";
import {
  useCreateObjectStorageMutation,
  useDeleteObjectStorageMutation,
} from "../objectstorage-mutation";

/**
 * Create an object storage bucket using the authenticated user's context.
 * Usage: createObjectStorageAction({ ... })
 */
export function createObjectStorageAction(
  request: Partial<ObjectStorageCreateRequest>
) {
  const objectStorageContext = createObjectStorageContext();
  const mutation = useCreateObjectStorageMutation(objectStorageContext);

  // Provide sensible defaults for object storage creation
  const defaultRequest: ObjectStorageCreateRequest = {
    bucketName: request.bucketName ?? generateObjectStorageName(),
    bucketPolicy: request.bucketPolicy ?? "private",
  };

  return mutation.mutate(defaultRequest);
}

/**
 * Delete an object storage bucket by name using the authenticated user's context.
 * Usage: deleteObjectStorageAction(bucketName)
 */
export function deleteObjectStorageAction(bucketName: string) {
  const objectStorageContext = createObjectStorageContext();
  const mutation = useDeleteObjectStorageMutation(objectStorageContext);
  return mutation.mutate({ bucketName });
}
