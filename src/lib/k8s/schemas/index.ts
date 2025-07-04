import { z } from "zod";

// API Context schema for k8s queries
export const K8sApiContextSchema = z.object({
  namespace: z.string(),
  kubeconfig: z.string(),
});

export type K8sApiContext = z.infer<typeof K8sApiContextSchema>;

// Re-export all schemas and types from split files

export * from "./custom-resource-schemas";
export * from "./deployment-schemas";
export * from "./instance-schemas";
export * from "./kubernetes-resource-schemas";
export * from "./request-schemas";
export * from "./resource-target-schemas";

// Union schemas for all resources
import {
  CustomResourceListSchema,
  CustomResourceSchema,
} from "./custom-resource-schemas";
import {
  DeploymentListSchema,
  DeploymentResourceSchema,
} from "./deployment-schemas";
import { InstanceListSchema, InstanceResourceSchema } from "./instance-schemas";

export const AnyKubernetesResourceSchema = z.union([
  DeploymentResourceSchema,
  CustomResourceSchema,
  InstanceResourceSchema,
]);

export const AnyKubernetesListSchema = z.union([
  DeploymentListSchema,
  CustomResourceListSchema,
  InstanceListSchema,
]);

// Inferred types for union schemas
export type AnyKubernetesResource = z.infer<typeof AnyKubernetesResourceSchema>;
export type AnyKubernetesList = z.infer<typeof AnyKubernetesListSchema>;
