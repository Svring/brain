export const ResourceType = {
  CUSTOM: "custom",
  BUILTIN: "builtin",
} as const;

export type ResourceTypeValue =
  (typeof ResourceType)[keyof typeof ResourceType];

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
    | "pvc";
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
} as const;
