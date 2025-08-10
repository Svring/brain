export interface CustomResourceConfig {
  type: "custom";
  resourceType: string;
  group: string;
  version: string;
  plural: string;
}

export const CUSTOM_RESOURCES: Record<string, CustomResourceConfig> = {
  // Cert Manager
  issuer: {
    type: "custom",
    resourceType: "issuer",
    group: "cert-manager.io",
    version: "v1",
    plural: "issuers",
  },
  certificate: {
    type: "custom",
    resourceType: "certificate",
    group: "cert-manager.io",
    version: "v1",
    plural: "certificates",
  },
  // KubeBlocks
  backup: {
    type: "custom",
    resourceType: "backup",
    group: "dataprotection.kubeblocks.io",
    version: "v1alpha1",
    plural: "backups",
  },
  // Sealos/Other
  devbox: {
    type: "custom",
    resourceType: "devbox",
    group: "devbox.sealos.io",
    version: "v1alpha1",
    plural: "devboxes",
  },
  cluster: {
    type: "custom",
    resourceType: "cluster",
    group: "apps.kubeblocks.io",
    version: "v1alpha1",
    plural: "clusters",
  },
  instance: {
    type: "custom",
    resourceType: "instance",
    group: "app.sealos.io",
    version: "v1",
    plural: "instances",
  },
  objectstoragebucket: {
    type: "custom",
    resourceType: "objectstoragebucket",
    group: "objectstorage.sealos.io",
    version: "v1",
    plural: "objectstoragebuckets",
  },
  app: {
    type: "custom",
    resourceType: "app",
    group: "app.sealos.io",
    version: "v1",
    plural: "apps",
  },
};
