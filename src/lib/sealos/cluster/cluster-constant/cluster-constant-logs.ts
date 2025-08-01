export const CLUSTER_LOG_TYPES = {
  redis: ["runtimeLog"],
  postgresql: ["runtimeLog"],
  mongodb: ["runtimeLog"],
  "apecloud-mysql": ["errorLog", "slowQuery"],
} as const;
