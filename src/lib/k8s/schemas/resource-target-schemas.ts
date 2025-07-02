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

// Inferred types for resource targets
export type CustomResourceTarget = z.infer<typeof CustomResourceTargetSchema>;
export type DeploymentTarget = z.infer<typeof DeploymentTargetSchema>;
export type ResourceTarget = z.infer<typeof ResourceTargetSchema>;
