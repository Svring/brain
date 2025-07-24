"use client";

import { useQuery } from "@tanstack/react-query";
import { getClusterSecretOptions } from "@/lib/k8s/k8s-method/k8s-query";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";

/**
 * Hook to get cluster connection credential secret
 * @param clusterName - Name of the cluster
 * @param context - Optional K8s context, will create one if not provided
 * @returns Query result containing the cluster secret
 */
export function useClusterSecret(context: K8sApiContext, clusterName: string) {
  return useQuery({
    ...getClusterSecretOptions(context, clusterName),
    enabled: !!clusterName && !!context.namespace && !!context.kubeconfig,
  });
}

/**
 * Get cluster secret query options for use with custom query clients
 * @param clusterName - Name of the cluster
 * @param context - Optional K8s context, will create one if not provided
 * @returns Query options for the cluster secret
 */
export function getClusterSecretQueryOptions(
  context: K8sApiContext,
  clusterName: string
) {
  return getClusterSecretOptions(context, clusterName);
}
