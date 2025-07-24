"use client";

import { useQuery } from "@tanstack/react-query";
import { getObjectStorageSecretOptions } from "@/lib/k8s/k8s-method/k8s-query";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";

/**
 * Hook to get object storage key secret
 * @param objectStorageName - Name of the object storage
 * @param context - Optional K8s context, will create one if not provided
 * @returns Query result containing the object storage secret
 */
export function useObjectStorageSecret(
  context: K8sApiContext,
  objectStorageName: string
) {
  return useQuery({
    ...getObjectStorageSecretOptions(context, objectStorageName),
    enabled: !!objectStorageName && !!context.namespace && !!context.kubeconfig,
  });
}

/**
 * Get object storage secret query options for use with custom query clients
 * @param objectStorageName - Name of the object storage
 * @param context - Optional K8s context, will create one if not provided
 * @returns Query options for the object storage secret
 */
export function getObjectStorageSecretQueryOptions(
  context: K8sApiContext,
  objectStorageName: string
) {
  return getObjectStorageSecretOptions(context, objectStorageName);
}
