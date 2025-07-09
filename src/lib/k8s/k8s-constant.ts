export const ResourceType = {
  CUSTOM: "custom",
  BUILTIN: "builtin",
} as const;

export type ResourceTypeValue =
  (typeof ResourceType)[keyof typeof ResourceType];

// Label constants for project operations
export const PROJECT_LABELS = {
  APP_DEPLOY_MANAGER: "cloud.sealos.io/app-deploy-manager",
  APP: "app",
} as const;

// Custom resource definitions for cert-manager
export const CERT_MANAGER_RESOURCES = {
  issuers: {
    type: ResourceType.CUSTOM,
    resourceType: "issuer",
    group: "cert-manager.io",
    version: "v1",
    plural: "issuers",
  } as CustomResourceConfig,
  certificates: {
    type: ResourceType.CUSTOM,
    resourceType: "certificate",
    group: "cert-manager.io",
    version: "v1",
    plural: "certificates",
  } as CustomResourceConfig,
} as const;

// Custom resource definitions for KubeBlocks
export const KUBEBLOCKS_RESOURCES = {
  backups: {
    type: ResourceType.CUSTOM,
    resourceType: "backup",
    group: "dataprotection.kubeblocks.io",
    version: "v1alpha1",
    plural: "backups",
  } as CustomResourceConfig,
} as const;

// Label constants for cluster operations
export const CLUSTER_LABELS = {
  APP_KUBERNETES_INSTANCE: "app.kubernetes.io/instance",
} as const;

// Types for resource configurations
export interface CustomResourceConfig {
  type: typeof ResourceType.CUSTOM;
  resourceType: string;
  group: string;
  version: string;
  plural: string;
}

export interface BuiltinResourceConfig {
  type: typeof ResourceType.BUILTIN;
  resourceType:
    | "deployment"
    | "service"
    | "ingress"
    | "statefulset"
    | "daemonset"
    | "configmap"
    | "secret"
    | "pod"
    | "pvc"
    | "horizontalpodautoscaler"
    | "role"
    | "rolebinding"
    | "serviceaccount"
    | "job"
    | "cronjob";
}

export type ResourceConfig = CustomResourceConfig | BuiltinResourceConfig;

export const RESOURCES = {
  // Custom Resources
  devbox: {
    type: ResourceType.CUSTOM,
    resourceType: "devbox",
    group: "devbox.sealos.io",
    version: "v1alpha1",
    plural: "devboxes",
  } as CustomResourceConfig,
  cluster: {
    type: ResourceType.CUSTOM,
    resourceType: "cluster",
    group: "apps.kubeblocks.io",
    version: "v1alpha1",
    plural: "clusters",
  } as CustomResourceConfig,
  instance: {
    type: ResourceType.CUSTOM,
    resourceType: "instance",
    group: "app.sealos.io",
    version: "v1",
    plural: "instances",
  } as CustomResourceConfig,
  objectstoragebucket: {
    type: ResourceType.CUSTOM,
    resourceType: "objectstoragebucket",
    group: "objectstorage.sealos.io",
    version: "v1",
    plural: "objectstoragebuckets",
  } as CustomResourceConfig,
  app: {
    type: ResourceType.CUSTOM,
    resourceType: "app",
    group: "app.sealos.io",
    version: "v1",
    plural: "apps",
  } as CustomResourceConfig,

  // Builtin Resources
  deployment: {
    type: ResourceType.BUILTIN,
    resourceType: "deployment",
  } as BuiltinResourceConfig,
  service: {
    type: ResourceType.BUILTIN,
    resourceType: "service",
  } as BuiltinResourceConfig,
  ingress: {
    type: ResourceType.BUILTIN,
    resourceType: "ingress",
  } as BuiltinResourceConfig,
  statefulset: {
    type: ResourceType.BUILTIN,
    resourceType: "statefulset",
  } as BuiltinResourceConfig,
  daemonset: {
    type: ResourceType.BUILTIN,
    resourceType: "daemonset",
  } as BuiltinResourceConfig,
  configmap: {
    type: ResourceType.BUILTIN,
    resourceType: "configmap",
  } as BuiltinResourceConfig,
  secret: {
    type: ResourceType.BUILTIN,
    resourceType: "secret",
  } as BuiltinResourceConfig,
  pod: {
    type: ResourceType.BUILTIN,
    resourceType: "pod",
  } as BuiltinResourceConfig,
  pvc: {
    type: ResourceType.BUILTIN,
    resourceType: "pvc",
  } as BuiltinResourceConfig,
  horizontalpodautoscaler: {
    type: ResourceType.BUILTIN,
    resourceType: "horizontalpodautoscaler",
  } as BuiltinResourceConfig,
  role: {
    type: ResourceType.BUILTIN,
    resourceType: "role",
  } as BuiltinResourceConfig,
  rolebinding: {
    type: ResourceType.BUILTIN,
    resourceType: "rolebinding",
  } as BuiltinResourceConfig,
  serviceaccount: {
    type: ResourceType.BUILTIN,
    resourceType: "serviceaccount",
  } as BuiltinResourceConfig,
  job: {
    type: ResourceType.BUILTIN,
    resourceType: "job",
  } as BuiltinResourceConfig,
  cronjob: {
    type: ResourceType.BUILTIN,
    resourceType: "cronjob",
  } as BuiltinResourceConfig,
} as const;
