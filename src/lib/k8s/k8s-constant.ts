export const ResourceType = {
  CUSTOM: "custom",
  DEPLOYMENT: "deployment",
} as const;

export type ResourceTypeValue =
  (typeof ResourceType)[keyof typeof ResourceType];

export const RESOURCES = {
  devbox: {
    type: ResourceType.CUSTOM,
    group: "devbox.sealos.io",
    version: "v1alpha1",
    plural: "devboxes",
  },
  cluster: {
    type: ResourceType.CUSTOM,
    group: "apps.kubeblocks.io",
    version: "v1alpha1",
    plural: "clusters",
  },
  deployment: {
    type: ResourceType.DEPLOYMENT,
    apiVersion: "apps/v1",
    kind: "Deployment",
  },
};
