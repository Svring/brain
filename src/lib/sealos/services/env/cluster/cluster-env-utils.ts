import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import type { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import type { Env } from "@/schemas/forms/universal/env-schema";

/**
 * Derives environment variables from cluster private connection
 * @param name - The cluster name used to generate environment variable names and secret references
 * @returns An array of environment variables conforming to EnvSchema
 */
export const deriveClusterEnvVariable = (name: string): Env[] => {
  const secretName = `${name}-conn-credential`;
  const secretKeys = ["port", "host", "password", "username"];

  return secretKeys.map((key) => ({
    name: `${name.toUpperCase()}_${key.toUpperCase()}`,
    valueFrom: {
      secretKeyRef: {
        name: secretName,
        key: key,
      },
    },
  }));
};
