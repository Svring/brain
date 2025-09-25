// Cluster type constants
export const CLUSTER_TYPES = [
  "postgresql",
  "mongodb",
  "apecloud-mysql",
  "redis",
  "kafka",
  "weaviate",
  "milvus",
  "pulsar",
] as const;

export type ClusterType = (typeof CLUSTER_TYPES)[number];

// Available cluster types for UI components (excludes pulsar and weaviate)
export const AVAILABLE_CLUSTER_TYPES = CLUSTER_TYPES.filter(
  (type) => type !== "pulsar" && type !== "weaviate"
);
