/**
 * Centralized query keys for React Query caching
 * This file contains all query keys used across the k8s module
 */

// Base query key prefixes
export const QUERY_KEY_PREFIX = {
  K8S: "k8s",
} as const;

// Resource operation types
export const QUERY_KEY_OPERATION = {
  LIST: "list",
  GET: "get",
} as const;

// Resource types
export const QUERY_KEY_RESOURCE_TYPE = {
  CUSTOM_RESOURCES: "custom-resources",
  CUSTOM_RESOURCE: "custom-resource",
  BUILTIN_RESOURCES: "builtin-resources",
  BUILTIN_RESOURCE: "builtin-resource",
  ALL_RESOURCES: "all-resources",
  ANNOTATION_BASED_RESOURCES: "annotation-based-resources",
  SECRET: "secret",
  CLUSTER_SECRET: "cluster-secret",
  OBJECTSTORAGE_SECRET: "objectstorage-secret",
  PODS_BY_OWNER: "pods-by-owner",
  SECRETS_BY_OWNER: "secrets-by-owner",
  DEVBOX: "devbox",
  DEVBOXES: "devboxes",
  CLUSTER: "cluster",
  CLUSTERS: "clusters",
  OBJECTSTORAGE: "objectstorage",
  OBJECTSTORAGES: "objectstorages",
} as const;

// Query key builders
export const buildQueryKey = {
  /**
   * Build query key for listing custom resources
   */
  listCustomResources: (
    group: string,
    version: string,
    namespace: string,
    plural: string,
    labelSelector?: string
  ) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.CUSTOM_RESOURCES,
    QUERY_KEY_OPERATION.LIST,
    group,
    version,
    namespace,
    plural,
    labelSelector,
  ],

  /**
   * Build query key for getting a custom resource
   */
  getCustomResource: (
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string
  ) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.CUSTOM_RESOURCE,
    QUERY_KEY_OPERATION.GET,
    group,
    version,
    namespace,
    plural,
    name,
  ],

  /**
   * Build query key for listing builtin resources
   */
  listBuiltinResources: (
    resourceType: string,
    namespace: string,
    labelSelector?: string
  ) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.BUILTIN_RESOURCES,
    QUERY_KEY_OPERATION.LIST,
    resourceType,
    namespace,
    labelSelector,
  ],

  /**
   * Build query key for getting a builtin resource
   */
  getBuiltinResource: (
    resourceType: string,
    namespace: string,
    name: string
  ) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.BUILTIN_RESOURCE,
    QUERY_KEY_OPERATION.GET,
    resourceType,
    namespace,
    name,
  ],

  /**
   * Build query key for listing all resources
   */
  listAllResources: (
    namespace: string,
    labelSelector?: string,
    builtinResourceTypes?: string[],
    customResourceTypes?: string[]
  ) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.ALL_RESOURCES,
    QUERY_KEY_OPERATION.LIST,
    namespace,
    labelSelector,
    builtinResourceTypes,
    customResourceTypes,
  ],

  /**
   * Build query key for annotation-based resources
   */
  listAnnotationBasedResources: (
    namespace: string,
    projectName: string,
    annotation: any
  ) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.ANNOTATION_BASED_RESOURCES,
    QUERY_KEY_OPERATION.LIST,
    namespace,
    projectName,
    JSON.stringify(annotation),
  ],

  /**
   * Build query key for getting a cluster secret
   */
  getClusterSecret: (namespace: string, clusterName: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.CLUSTER_SECRET,
    QUERY_KEY_OPERATION.GET,
    namespace,
    clusterName,
  ],

  /**
   * Build query key for getting an object storage secret
   */
  getObjectStorageSecret: (namespace: string, objectStorageName: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.OBJECTSTORAGE_SECRET,
    QUERY_KEY_OPERATION.GET,
    namespace,
    objectStorageName,
  ],

  /**
   * Build query key for getting pods by owner
   */
  getPodsByOwner: (namespace: string, ownerName: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.PODS_BY_OWNER,
    namespace,
    ownerName,
  ],

  /**
   * Build query key for getting secrets by owner
   */
  getSecretsByOwner: (namespace: string, ownerName: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.SECRETS_BY_OWNER,
    namespace,
    ownerName,
  ],

  /**
   * Build query key for project resources (used in query invalidation)
   */
  projectResources: () => ["project", "resources"] as const,

  /**
   * Build query key for inventory (used in query invalidation)
   */
  inventory: () => ["inventory"] as const,

  /**
   * Build query key for listing devboxes
   */
  listDevboxes: (namespace: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.DEVBOXES,
    QUERY_KEY_OPERATION.LIST,
    namespace,
  ],

  /**
   * Build query key for getting a devbox
   */
  getDevbox: (namespace: string, name: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.DEVBOX,
    QUERY_KEY_OPERATION.GET,
    namespace,
    name,
  ],

  /**
   * Build query key for listing clusters
   */
  listClusters: (namespace: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.CLUSTERS,
    QUERY_KEY_OPERATION.LIST,
    namespace,
  ],

  /**
   * Build query key for getting a cluster
   */
  getCluster: (namespace: string, name: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.CLUSTER,
    QUERY_KEY_OPERATION.GET,
    namespace,
    name,
  ],

  /**
   * Build query key for listing object storages
   */
  listObjectStorages: (namespace: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.OBJECTSTORAGES,
    QUERY_KEY_OPERATION.LIST,
    namespace,
  ],

  /**
   * Build query key for getting an object storage
   */
  getObjectStorage: (namespace: string, name: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.OBJECTSTORAGE,
    QUERY_KEY_OPERATION.GET,
    namespace,
    name,
  ],

  /**
   * Build query key for getting cluster log files
   */
  getClusterLogFiles: (namespace: string, name: string) => [
    QUERY_KEY_PREFIX.K8S,
    QUERY_KEY_RESOURCE_TYPE.CLUSTER,
    "log-files",
    namespace,
    name,
  ],
} as const;
