import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import type { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

/**
 * Derives environment variables from cluster private connection
 * @param k8sContext - The Kubernetes API context containing namespace information
 * @param clusterObject - The complete cluster object containing connection details
 * @returns An object containing environment variables for the cluster connection
 */
export const deriveEnvVariable = (
  k8sContext: K8sApiContext,
  clusterObject: ClusterObject
) => {
  try {
    const { connection, name: clusterName } = clusterObject;
    const { privateConnection, publicConnection } = connection;

    if (!privateConnection) {
      return null;
    }

    const envVars: Record<string, string> = {
      [`${clusterName.toUpperCase()}_CONNECTION_STRING`]:
        privateConnection.connectionString,
    };

    // Add public connection string if it exists
    if (publicConnection) {
      envVars[`${clusterName.toUpperCase()}_PUBLIC_CONNECTION_STRING`] =
        publicConnection.connectionString;
    }

    return envVars;
  } catch (error) {
    console.error("Error deriving environment variables from cluster:", error);
    return null;
  }
};
