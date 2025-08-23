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
    const { connection, type: clusterType, name: clusterName } = clusterObject;
    const privateConnection = connection.privateConnection;
    const namespace = k8sContext.namespace;

    if (!privateConnection || !namespace) {
      return null;
    }

    const { host, port, username, password } = privateConnection;

    // Construct the internal service URL: {host}.{namespace}.svc
    const internalUrl = `${host}.${namespace}.svc`;

    // Construct the connection string based on cluster type
    let connectionString: string;

    switch (clusterType.toLowerCase()) {
      case "postgresql":
        connectionString = `postgresql://${username}:${password}@${internalUrl}:${port}`;
        break;
      case "mongodb":
        connectionString = `mongodb://${username}:${password}@${internalUrl}:${port}`;
        break;
      case "redis":
        connectionString = `redis://${username}:${password}@${internalUrl}:${port}`;
        break;
      case "apecloud-mysql":
        connectionString = `mysql://${username}:${password}@${internalUrl}:${port}`;
        break;
      case "kafka":
        connectionString = `${internalUrl}-kafka-broker:${port}`;
        break;
      case "milvus":
        connectionString = `${internalUrl}-milvus:${port}`;
        break;
      default:
        connectionString = `${clusterType}://${username}:${password}@${internalUrl}:${port}`;
    }

    return {
      [`${clusterName.toUpperCase()}_CONNECTION_STRING`]: connectionString,
    };
  } catch (error) {
    console.error("Error deriving environment variables from cluster:", error);
    return null;
  }
};
