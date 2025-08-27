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
