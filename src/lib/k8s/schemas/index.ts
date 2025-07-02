import { z } from "zod";

// Input parameter schemas for queries
export const ListCustomResourceRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  namespace: z.string(),
  plural: z.string(),
});

export const GetCustomResourceRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  namespace: z.string(),
  plural: z.string(),
  name: z.string(),
});

export const ListDeploymentsRequestSchema = z.object({
  namespace: z.string(),
});

export const GetDeploymentRequestSchema = z.object({
  namespace: z.string(),
  name: z.string(),
});

export const ListAllResourcesRequestSchema = z.object({
  namespace: z.string(),
});

// Input parameter schemas for mutations
export const PatchCustomResourceRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  namespace: z.string(),
  plural: z.string(),
  name: z.string(),
  patchBody: z.array(z.unknown()),
});

export const PatchCustomResourceMetadataRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  namespace: z.string(),
  plural: z.string(),
  name: z.string(),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
  value: z.string(),
});

export const RemoveCustomResourceMetadataRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  namespace: z.string(),
  plural: z.string(),
  name: z.string(),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
});

export const PatchDeploymentMetadataRequestSchema = z.object({
  namespace: z.string(),
  name: z.string(),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
  value: z.string(),
});

export const RemoveDeploymentMetadataRequestSchema = z.object({
  namespace: z.string(),
  name: z.string(),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
});

// Base resource target schemas
export const CustomResourceTargetSchema = z.object({
  type: z.literal("custom"),
  group: z.string(),
  version: z.string(),
  namespace: z.string(),
  plural: z.string(),
  name: z.string(),
});

export const DeploymentTargetSchema = z.object({
  type: z.literal("deployment"),
  namespace: z.string(),
  name: z.string(),
});

// Union type for all resource targets
export const ResourceTargetSchema = z.discriminatedUnion("type", [
  CustomResourceTargetSchema,
  DeploymentTargetSchema,
]);

// Batch operation schemas
export const BatchPatchRequestSchema = z.object({
  resources: z.array(ResourceTargetSchema),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
  value: z.string(),
});

export const BatchRemoveRequestSchema = z.object({
  resources: z.array(ResourceTargetSchema),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
});

// Inferred types for input parameters
export type ListCustomResourceRequest = z.infer<
  typeof ListCustomResourceRequestSchema
>;
export type GetCustomResourceRequest = z.infer<
  typeof GetCustomResourceRequestSchema
>;
export type ListDeploymentsRequest = z.infer<
  typeof ListDeploymentsRequestSchema
>;
export type GetDeploymentRequest = z.infer<typeof GetDeploymentRequestSchema>;
export type ListAllResourcesRequest = z.infer<
  typeof ListAllResourcesRequestSchema
>;
export type PatchCustomResourceRequest = z.infer<
  typeof PatchCustomResourceRequestSchema
>;
export type PatchCustomResourceMetadataRequest = z.infer<
  typeof PatchCustomResourceMetadataRequestSchema
>;
export type RemoveCustomResourceMetadataRequest = z.infer<
  typeof RemoveCustomResourceMetadataRequestSchema
>;
export type PatchDeploymentMetadataRequest = z.infer<
  typeof PatchDeploymentMetadataRequestSchema
>;
export type RemoveDeploymentMetadataRequest = z.infer<
  typeof RemoveDeploymentMetadataRequestSchema
>;

// Inferred types for existing schemas
export type CustomResourceTarget = z.infer<typeof CustomResourceTargetSchema>;
export type DeploymentTarget = z.infer<typeof DeploymentTargetSchema>;
export type ResourceTarget = z.infer<typeof ResourceTargetSchema>;
export type BatchPatchRequest = z.infer<typeof BatchPatchRequestSchema>;
export type BatchRemoveRequest = z.infer<typeof BatchRemoveRequestSchema>;
