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
  apiVersion: string;
  kind: string;
  listMethod: string;
  getMethod: string;
  apiClient: string;
}

export type ResourceConfig = CustomResourceConfig | BuiltinResourceConfig;

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

// Custom resource configurations
export const CUSTOM_RESOURCES = {
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
} as const;

// Builtin resource configurations with detailed API metadata
export const BUILTIN_RESOURCES = {
  deployment: {
    type: ResourceType.BUILTIN,
    resourceType: "deployment",
    apiVersion: "apps/v1",
    kind: "Deployment",
    listMethod: "listNamespacedDeployment",
    getMethod: "readNamespacedDeployment",
    apiClient: "appsApi",
  } as BuiltinResourceConfig,
  service: {
    type: ResourceType.BUILTIN,
    resourceType: "service",
    apiVersion: "v1",
    kind: "Service",
    listMethod: "listNamespacedService",
    getMethod: "readNamespacedService",
    apiClient: "coreApi",
  } as BuiltinResourceConfig,
  ingress: {
    type: ResourceType.BUILTIN,
    resourceType: "ingress",
    apiVersion: "networking.k8s.io/v1",
    kind: "Ingress",
    listMethod: "listNamespacedIngress",
    getMethod: "readNamespacedIngress",
    apiClient: "networkingApi",
  } as BuiltinResourceConfig,
  statefulset: {
    type: ResourceType.BUILTIN,
    resourceType: "statefulset",
    apiVersion: "apps/v1",
    kind: "StatefulSet",
    listMethod: "listNamespacedStatefulSet",
    getMethod: "readNamespacedStatefulSet",
    apiClient: "appsApi",
  } as BuiltinResourceConfig,
  daemonset: {
    type: ResourceType.BUILTIN,
    resourceType: "daemonset",
    apiVersion: "apps/v1",
    kind: "DaemonSet",
    listMethod: "listNamespacedDaemonSet",
    getMethod: "readNamespacedDaemonSet",
    apiClient: "appsApi",
  } as BuiltinResourceConfig,
  configmap: {
    type: ResourceType.BUILTIN,
    resourceType: "configmap",
    apiVersion: "v1",
    kind: "ConfigMap",
    listMethod: "listNamespacedConfigMap",
    getMethod: "readNamespacedConfigMap",
    apiClient: "coreApi",
  } as BuiltinResourceConfig,
  secret: {
    type: ResourceType.BUILTIN,
    resourceType: "secret",
    apiVersion: "v1",
    kind: "Secret",
    listMethod: "listNamespacedSecret",
    getMethod: "readNamespacedSecret",
    apiClient: "coreApi",
  } as BuiltinResourceConfig,
  pod: {
    type: ResourceType.BUILTIN,
    resourceType: "pod",
    apiVersion: "v1",
    kind: "Pod",
    listMethod: "listNamespacedPod",
    getMethod: "readNamespacedPod",
    apiClient: "coreApi",
  } as BuiltinResourceConfig,
  pvc: {
    type: ResourceType.BUILTIN,
    resourceType: "pvc",
    apiVersion: "v1",
    kind: "PersistentVolumeClaim",
    listMethod: "listNamespacedPersistentVolumeClaim",
    getMethod: "readNamespacedPersistentVolumeClaim",
    apiClient: "coreApi",
  } as BuiltinResourceConfig,
  horizontalpodautoscaler: {
    type: ResourceType.BUILTIN,
    resourceType: "horizontalpodautoscaler",
    apiVersion: "autoscaling/v2",
    kind: "HorizontalPodAutoscaler",
    listMethod: "listNamespacedHorizontalPodAutoscaler",
    getMethod: "readNamespacedHorizontalPodAutoscaler",
    apiClient: "autoscalingApi",
  } as BuiltinResourceConfig,
  role: {
    type: ResourceType.BUILTIN,
    resourceType: "role",
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    listMethod: "listNamespacedRole",
    getMethod: "readNamespacedRole",
    apiClient: "rbacApi",
  } as BuiltinResourceConfig,
  rolebinding: {
    type: ResourceType.BUILTIN,
    resourceType: "rolebinding",
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    listMethod: "listNamespacedRoleBinding",
    getMethod: "readNamespacedRoleBinding",
    apiClient: "rbacApi",
  } as BuiltinResourceConfig,
  serviceaccount: {
    type: ResourceType.BUILTIN,
    resourceType: "serviceaccount",
    apiVersion: "v1",
    kind: "ServiceAccount",
    listMethod: "listNamespacedServiceAccount",
    getMethod: "readNamespacedServiceAccount",
    apiClient: "coreApi",
  } as BuiltinResourceConfig,
  job: {
    type: ResourceType.BUILTIN,
    resourceType: "job",
    apiVersion: "batch/v1",
    kind: "Job",
    listMethod: "listNamespacedJob",
    getMethod: "readNamespacedJob",
    apiClient: "batchApi",
  } as BuiltinResourceConfig,
  cronjob: {
    type: ResourceType.BUILTIN,
    resourceType: "cronjob",
    apiVersion: "batch/v1",
    kind: "CronJob",
    listMethod: "listNamespacedCronJob",
    getMethod: "readNamespacedCronJob",
    apiClient: "batchApi",
  } as BuiltinResourceConfig,
} as const;

// Combined resource configurations for backward compatibility
export const RESOURCES = {
  ...CUSTOM_RESOURCES,
  ...BUILTIN_RESOURCES,
} as const;
