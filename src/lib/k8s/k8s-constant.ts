export const ResourceType = {
  CUSTOM: "custom",
  DEPLOYMENT: "deployment",
} as const;

export type ResourceTypeValue =
  (typeof ResourceType)[keyof typeof ResourceType];

// Types for resource configurations
export interface CustomResourceConfig {
  type: typeof ResourceType.CUSTOM;
  group: string;
  version: string;
  plural: string;
}

export interface DeploymentResourceConfig {
  type: typeof ResourceType.DEPLOYMENT;
  apiVersion: string;
  kind: string;
}

export type ResourceConfig = CustomResourceConfig | DeploymentResourceConfig;

export const RESOURCES = {
  devbox: {
    type: ResourceType.CUSTOM,
    group: "devbox.sealos.io",
    version: "v1alpha1",
    plural: "devboxes",
  } as CustomResourceConfig,
  cluster: {
    type: ResourceType.CUSTOM,
    group: "apps.kubeblocks.io",
    version: "v1alpha1",
    plural: "clusters",
  } as CustomResourceConfig,
  deployment: {
    type: ResourceType.DEPLOYMENT,
    apiVersion: "apps/v1",
    kind: "Deployment",
  } as DeploymentResourceConfig,
} as const;
