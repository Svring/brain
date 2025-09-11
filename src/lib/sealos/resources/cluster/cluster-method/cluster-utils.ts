import { convertToDbconnUrl } from "@/lib/sealos/sealos-utils";

/**
 * Generates a random string of lowercase alphabets
 * @param length - The length of the random string (default: 5)
 * @returns A random string of lowercase alphabets
 */
function generateRandomString(length: number = 5): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates an automatic name for a cluster resource
 * @param prefix - Optional prefix for the name (default: 'cluster')
 * @returns A generated name in the format 'cluster-XXXXX' where XXXXX is random lowercase alphabets
 */
export const generateClusterName = (prefix: string = "cluster"): string => {
  const randomString = generateRandomString(5);
  return `${prefix}-${randomString}`;
};

/**
 * Composes a private connection string for a cluster resource
 * @param clusterData - The cluster object containing connection information
 * @param namespace - The namespace where the cluster is deployed
 * @returns A private connection string or null if the required data is not available
 */
export const composeClusterPrivateConnectionString = (
  clusterData: any,
  namespace: string
): string | null => {
  try {
    const { connection, type: clusterType } = clusterData;
    const privateConnection = connection?.privateConnection;

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

    return connectionString;
  } catch (error) {
    console.error("Error constructing private connection string:", error);
    return null;
  }
};

/**
 * Composes a connection string for a cluster resource
 * @param clusterData - The cluster object containing connection information
 * @param regionUrl - The region URL for the cluster
 * @returns A connection string or null if the required data is not available
 */
export const composeClusterPublicConnectionString = (
  clusterData: any,
  regionUrl: string
): string | null => {
  try {
    const publicConnection = clusterData.connection?.publicConnection;
    const privateConnection = clusterData.connection?.privateConnection;
    const type = clusterData.type;

    if (!regionUrl || !publicConnection?.port || !privateConnection || !type) {
      return null;
    }

    const dbconnUrl = convertToDbconnUrl(regionUrl);
    const { username, password } = privateConnection;

    return `${type}://${username}:${password}@${dbconnUrl}:${publicConnection.port}/?directConnection=true`;
  } catch (error) {
    console.error("Error constructing connection string:", error);
    return null;
  }
};

/**
 * Converts a cluster resource to a simplified list item with only essential fields
 * @param clusterResource - The full cluster K8s resource object
 * @returns A simplified cluster list item with name, kind, type, status, and inProject
 */
export const convertClusterToSimplifiedList = (clusterResource: any) => {
  return {
    name: clusterResource.metadata?.name,
    kind: clusterResource.kind,
    type: clusterResource.spec?.clusterDefinitionRef,
    status: clusterResource.status?.phase,
    inProject:
      clusterResource.metadata?.labels?.["cloud.sealos.io/deploy-on-sealos"],
  };
};

/**
 * Converts an array of cluster resources to a simplified list
 * @param clusterResources - Array of full cluster K8s resource objects
 * @returns Array of simplified cluster list items
 */
export const convertClusterListToSimplified = (clusterResources: any[]) => {
  return clusterResources.map(convertClusterToSimplifiedList);
};

/**
 * Maps database type names to supported API cluster types
 * @param type - The database type name to map
 * @returns The mapped cluster type for API calls
 */
export const mapDatabaseTypeToEnum = (type: string): string => {
  const typeMap: Record<string, string> = {
    postgresql: "postgresql",
    mongodb: "mongodb",
    "apecloud-mysql": "apecloud-mysql",
    redis: "redis",
    kafka: "kafka",
    weaviate: "weaviate",
    milvus: "milvus",
    pulsar: "pulsar",
  };
  return typeMap[type] || "postgresql";
};

/**
 * Parses cluster log data and extracts logFiles as an array of strings
 * @param logData - The cluster log data object containing supported flag and data
 * @returns Array of log file names from all cluster instances
 */
export const parseClusterLogFiles = (logData: any): string[] => {
  try {
    if (!logData?.data || typeof logData.data !== "object") {
      return [];
    }

    const logFiles: string[] = [];

    // Iterate through each cluster instance
    Object.values(logData.data).forEach((clusterInstance: any) => {
      if (
        clusterInstance?.logFiles &&
        Array.isArray(clusterInstance.logFiles)
      ) {
        // Extract file names from logFiles array
        clusterInstance.logFiles.forEach((logFile: any) => {
          if (logFile?.name && typeof logFile.name === "string") {
            logFiles.push(logFile.name);
          }
        });
      }
    });

    return logFiles;
  } catch (error) {
    console.error("Error parsing cluster log files:", error);
    return [];
  }
};
