/**
 * Labels used for instance (project) related resource operations
 */
export const INSTANCE_RELATE_RESOURCE_LABELS = {
  /** Label used for direct affiliated resources */
  DEPLOY_ON_SEALOS: "cloud.sealos.io/deploy-on-sealos",
  /** Label used specifically for PVCs in instance deletion */
  // APP: "app",
  /** Label used for services, ingresses, cert-manager resources, and other managed resources in instance deletion */
  // MANAGED_BY: "app.kubernetes.io/managed-by",
} as const;

export const DEPLOYMENT_RELATE_RESOURCE_LABELS = {
  /** Label used for deployment-related resources like backups in deployment deletion */
  APP_DEPLOY_MANAGER: "cloud.sealos.io/app-deploy-manager",
} as const;

export const STATEFULSET_RELATE_RESOURCE_LABELS = {
  APP_DEPLOY_MANAGER: "cloud.sealos.io/app-deploy-manager",
} as const;

export const DEVBOX_RELATE_RESOURCE_LABELS = {
  /** Label used for devbox-related resources like backups in devbox deletion */
  DEVBOX_MANAGER: "cloud.sealos.io/devbox-manager",
} as const;

/**
 * Labels used for cluster related resource operations
 */
export const CLUSTER_RELATE_RESOURCE_LABELS = {
  /** Label used for cluster-related resources like backups in cluster deletion */
  APP_KUBERNETES_INSTANCE: "app.kubernetes.io/instance",
  // DB_PROVIDER_CR: "sealos-db-provider-cr",
} as const;
