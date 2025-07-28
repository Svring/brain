export interface BuiltinResourceConfig {
  type: "builtin";
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
  createMethod: string;
  deleteMethod: string;
  patchMethod: string;
  replaceMethod: string; // For update/replace operations
  deleteCollectionMethod?: string; // Optional as not all resources support bulk deletion
  apiClient: string;
}

export const BUILTIN_RESOURCES: Record<string, BuiltinResourceConfig> = {
  deployment: {
    type: "builtin",
    resourceType: "deployment",
    apiVersion: "apps/v1",
    kind: "Deployment",
    listMethod: "listNamespacedDeployment",
    getMethod: "readNamespacedDeployment",
    createMethod: "createNamespacedDeployment",
    deleteMethod: "deleteNamespacedDeployment",
    patchMethod: "patchNamespacedDeployment",
    replaceMethod: "replaceNamespacedDeployment",
    apiClient: "appsApi",
  },
  service: {
    type: "builtin",
    resourceType: "service",
    apiVersion: "v1",
    kind: "Service",
    listMethod: "listNamespacedService",
    getMethod: "readNamespacedService",
    createMethod: "createNamespacedService",
    deleteMethod: "deleteNamespacedService",
    patchMethod: "patchNamespacedService",
    replaceMethod: "replaceNamespacedService",
    deleteCollectionMethod: "deleteCollectionNamespacedService",
    apiClient: "coreApi",
  },
  ingress: {
    type: "builtin",
    resourceType: "ingress",
    apiVersion: "networking.k8s.io/v1",
    kind: "Ingress",
    listMethod: "listNamespacedIngress",
    getMethod: "readNamespacedIngress",
    createMethod: "createNamespacedIngress",
    deleteMethod: "deleteNamespacedIngress",
    patchMethod: "patchNamespacedIngress",
    replaceMethod: "replaceNamespacedIngress",
    deleteCollectionMethod: "deleteCollectionNamespacedIngress",
    apiClient: "networkingApi",
  },
  statefulset: {
    type: "builtin",
    resourceType: "statefulset",
    apiVersion: "apps/v1",
    kind: "StatefulSet",
    listMethod: "listNamespacedStatefulSet",
    getMethod: "readNamespacedStatefulSet",
    createMethod: "createNamespacedStatefulSet",
    deleteMethod: "deleteNamespacedStatefulSet",
    patchMethod: "patchNamespacedStatefulSet",
    replaceMethod: "replaceNamespacedStatefulSet",
    apiClient: "appsApi",
  },
  daemonset: {
    type: "builtin",
    resourceType: "daemonset",
    apiVersion: "apps/v1",
    kind: "DaemonSet",
    listMethod: "listNamespacedDaemonSet",
    getMethod: "readNamespacedDaemonSet",
    createMethod: "createNamespacedDaemonSet",
    deleteMethod: "deleteNamespacedDaemonSet",
    patchMethod: "patchNamespacedDaemonSet",
    replaceMethod: "replaceNamespacedDaemonSet",
    apiClient: "appsApi",
  },
  configmap: {
    type: "builtin",
    resourceType: "configmap",
    apiVersion: "v1",
    kind: "ConfigMap",
    listMethod: "listNamespacedConfigMap",
    getMethod: "readNamespacedConfigMap",
    createMethod: "createNamespacedConfigMap",
    deleteMethod: "deleteNamespacedConfigMap",
    patchMethod: "patchNamespacedConfigMap",
    replaceMethod: "replaceNamespacedConfigMap",
    apiClient: "coreApi",
  },
  secret: {
    type: "builtin",
    resourceType: "secret",
    apiVersion: "v1",
    kind: "Secret",
    listMethod: "listNamespacedSecret",
    getMethod: "readNamespacedSecret",
    createMethod: "createNamespacedSecret",
    deleteMethod: "deleteNamespacedSecret",
    patchMethod: "patchNamespacedSecret",
    replaceMethod: "replaceNamespacedSecret",
    apiClient: "coreApi",
  },
  pod: {
    type: "builtin",
    resourceType: "pod",
    apiVersion: "v1",
    kind: "Pod",
    listMethod: "listNamespacedPod",
    getMethod: "readNamespacedPod",
    createMethod: "createNamespacedPod",
    deleteMethod: "deleteNamespacedPod",
    patchMethod: "patchNamespacedPod",
    replaceMethod: "replaceNamespacedPod",
    apiClient: "coreApi",
  },
  pvc: {
    type: "builtin",
    resourceType: "pvc",
    apiVersion: "v1",
    kind: "PersistentVolumeClaim",
    listMethod: "listNamespacedPersistentVolumeClaim",
    getMethod: "readNamespacedPersistentVolumeClaim",
    createMethod: "createNamespacedPersistentVolumeClaim",
    deleteMethod: "deleteNamespacedPersistentVolumeClaim",
    patchMethod: "patchNamespacedPersistentVolumeClaim",
    replaceMethod: "replaceNamespacedPersistentVolumeClaim",
    deleteCollectionMethod: "deleteCollectionNamespacedPersistentVolumeClaim",
    apiClient: "coreApi",
  },
  hpa: {
    type: "builtin",
    resourceType: "horizontalpodautoscaler",
    apiVersion: "autoscaling/v2",
    kind: "HorizontalPodAutoscaler",
    listMethod: "listNamespacedHorizontalPodAutoscaler",
    getMethod: "readNamespacedHorizontalPodAutoscaler",
    createMethod: "createNamespacedHorizontalPodAutoscaler",
    deleteMethod: "deleteNamespacedHorizontalPodAutoscaler",
    patchMethod: "patchNamespacedHorizontalPodAutoscaler",
    replaceMethod: "replaceNamespacedHorizontalPodAutoscaler",
    apiClient: "autoscalingApi",
  },
  role: {
    type: "builtin",
    resourceType: "role",
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    listMethod: "listNamespacedRole",
    getMethod: "readNamespacedRole",
    createMethod: "createNamespacedRole",
    deleteMethod: "deleteNamespacedRole",
    patchMethod: "patchNamespacedRole",
    replaceMethod: "replaceNamespacedRole",
    apiClient: "rbacApi",
  },
  rolebinding: {
    type: "builtin",
    resourceType: "rolebinding",
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    listMethod: "listNamespacedRoleBinding",
    getMethod: "readNamespacedRoleBinding",
    createMethod: "createNamespacedRoleBinding",
    deleteMethod: "deleteNamespacedRoleBinding",
    patchMethod: "patchNamespacedRoleBinding",
    replaceMethod: "replaceNamespacedRoleBinding",
    apiClient: "rbacApi",
  },
  serviceaccount: {
    type: "builtin",
    resourceType: "serviceaccount",
    apiVersion: "v1",
    kind: "ServiceAccount",
    listMethod: "listNamespacedServiceAccount",
    getMethod: "readNamespacedServiceAccount",
    createMethod: "createNamespacedServiceAccount",
    deleteMethod: "deleteNamespacedServiceAccount",
    patchMethod: "patchNamespacedServiceAccount",
    replaceMethod: "replaceNamespacedServiceAccount",
    apiClient: "coreApi",
  },
  job: {
    type: "builtin",
    resourceType: "job",
    apiVersion: "batch/v1",
    kind: "Job",
    listMethod: "listNamespacedJob",
    getMethod: "readNamespacedJob",
    createMethod: "createNamespacedJob",
    deleteMethod: "deleteNamespacedJob",
    patchMethod: "patchNamespacedJob",
    replaceMethod: "replaceNamespacedJob",
    apiClient: "batchApi",
  },
  cronjob: {
    type: "builtin",
    resourceType: "cronjob",
    apiVersion: "batch/v1",
    kind: "CronJob",
    listMethod: "listNamespacedCronJob",
    getMethod: "readNamespacedCronJob",
    createMethod: "createNamespacedCronJob",
    deleteMethod: "deleteNamespacedCronJob",
    patchMethod: "patchNamespacedCronJob",
    replaceMethod: "replaceNamespacedCronJob",
    apiClient: "batchApi",
  },
};
