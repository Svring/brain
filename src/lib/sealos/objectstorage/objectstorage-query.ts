"use client";

import { useQuery } from "@tanstack/react-query";
import { getObjectStorageSecretOptions } from "@/lib/k8s/k8s-method/k8s-query";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";

/**
 * Hook to get object storage key secret
 * @param objectStorageName - Name of the object storage
 * @param context - Optional K8s context, will create one if not provided
 * @returns Query result containing the object storage secret
 */
export function useObjectStorageSecret(
  objectStorageName: string,
  context?: K8sApiContext
) {
  const k8sContext = context || createK8sContext();

  return useQuery({
    ...getObjectStorageSecretOptions(k8sContext, objectStorageName),
    enabled:
      !!objectStorageName && !!k8sContext.namespace && !!k8sContext.kubeconfig,
  });
}

/**
 * Get object storage secret query options for use with custom query clients
 * @param objectStorageName - Name of the object storage
 * @param context - Optional K8s context, will create one if not provided
 * @returns Query options for the object storage secret
 */
export function getObjectStorageSecretQueryOptions(
  objectStorageName: string,
  context?: K8sApiContext
) {
  const k8sContext = context || createK8sContext();
  return getObjectStorageSecretOptions(k8sContext, objectStorageName);
}
