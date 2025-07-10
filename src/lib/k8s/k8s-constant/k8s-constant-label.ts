export const PROJECT_NAME_LABEL_KEY = "cloud.sealos.io/deploy-on-sealos";

export const PROJECT_RELATE_RESOURCE_LABELS = {
  APP_DEPLOY_MANAGER: "cloud.sealos.io/app-deploy-manager",
  APP: "app",
} as const;

export const CLUSTER_RELATE_RESOURCE_LABELS = {
  APP_KUBERNETES_INSTANCE: "app.kubernetes.io/instance",
} as const;
