import { z } from "zod";

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

// Inferred types
export type CustomResourceTarget = z.infer<typeof CustomResourceTargetSchema>;
export type DeploymentTarget = z.infer<typeof DeploymentTargetSchema>;
export type ResourceTarget = z.infer<typeof ResourceTargetSchema>;
export type BatchPatchRequest = z.infer<typeof BatchPatchRequestSchema>;
export type BatchRemoveRequest = z.infer<typeof BatchRemoveRequestSchema>;
