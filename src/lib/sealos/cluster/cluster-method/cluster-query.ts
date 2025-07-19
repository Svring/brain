"use client";

import { useQuery } from "@tanstack/react-query";
import { getClusterSecretOptions } from "@/lib/k8s/k8s-method/k8s-query";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";

/**
 * Hook to get cluster connection credential secret
 * @param clusterName - Name of the cluster
 * @param context - Optional K8s context, will create one if not provided
 * @returns Query result containing the cluster secret
 */
export function useClusterSecret(clusterName: string, context?: K8sApiContext) {
  const k8sContext = context || createK8sContext();

  return useQuery({
    ...getClusterSecretOptions(k8sContext, clusterName),
    enabled: !!clusterName && !!k8sContext.namespace && !!k8sContext.kubeconfig,
  });
}

/**
 * Get cluster secret query options for use with custom query clients
 * @param clusterName - Name of the cluster
 * @param context - Optional K8s context, will create one if not provided
 * @returns Query options for the cluster secret
 */
export function getClusterSecretQueryOptions(
  clusterName: string,
  context?: K8sApiContext
) {
  const k8sContext = context || createK8sContext();
  return getClusterSecretOptions(k8sContext, clusterName);
}
