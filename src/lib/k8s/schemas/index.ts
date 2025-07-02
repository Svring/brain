// Re-export all schemas and types from split files

export * from "./custom-resource-schemas";
export * from "./deployment-schemas";
export * from "./kubernetes-resource-schemas";
export * from "./request-schemas";
export * from "./resource-target-schemas";

// Union schemas for all resources
import { z } from "zod";
import {
  CustomResourceListSchema,
  CustomResourceSchema,
} from "./custom-resource-schemas";
import {
  DeploymentListSchema,
  DeploymentResourceSchema,
} from "./deployment-schemas";

export const AnyKubernetesResourceSchema = z.union([
  DeploymentResourceSchema,
  CustomResourceSchema,
]);

export const AnyKubernetesListSchema = z.union([
  DeploymentListSchema,
  CustomResourceListSchema,
]);

// Inferred types for union schemas
export type AnyKubernetesResource = z.infer<typeof AnyKubernetesResourceSchema>;
export type AnyKubernetesList = z.infer<typeof AnyKubernetesListSchema>;
