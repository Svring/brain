export const PROJECT_NAME_LABEL_KEY = "cloud.sealos.io/deploy-on-sealos";

/**
 * Labels used for project (instance) related resource operations
 */
export const PROJECT_RELATE_RESOURCE_LABELS = {
  /** Label used for most project-related resources managed by app-deploy-manager */
  APP_DEPLOY_MANAGER: "cloud.sealos.io/app-deploy-manager",
  /** Label used specifically for PVCs in project deletion */
  APP: "app",
  /** Label used for services, ingresses, cert-manager resources, and other managed resources in project deletion */
  MANAGED_BY: "app.kubernetes.io/managed-by",
} as const;

/**
 * Labels used for cluster related resource operations
 */
export const CLUSTER_RELATE_RESOURCE_LABELS = {
  /** Label used for cluster-related resources like backups in cluster deletion */
  APP_KUBERNETES_INSTANCE: "app.kubernetes.io/instance",
} as const;

/**
 * All deletion-related labels combined for easy access
 */
export const DELETION_LABELS = {
  PROJECT: PROJECT_RELATE_RESOURCE_LABELS,
  CLUSTER: CLUSTER_RELATE_RESOURCE_LABELS,
} as const;
