import { z } from "zod";
import { BUILTIN_RESOURCES } from "../../../k8s-constant/k8s-constant-builtin-resource";

// Builtin resource types enum (from BUILTIN_RESOURCES keys)
export const BuiltinResourceTypeSchema = z.enum([
  ...(Object.keys(BUILTIN_RESOURCES) as [keyof typeof BUILTIN_RESOURCES]),
]);

// Custom resource target schema - for targeting specific custom resources
export const CustomResourceTargetSchema = z.object({
  type: z.literal("custom"),
  group: z.string(),
  version: z.string(),
  plural: z.string(),
  name: z.string().optional(), // Optional for list operations
  labelSelector: z.string().optional(),
});

// Builtin resource target schema - for targeting specific builtin resources
export const BuiltinResourceTargetSchema = z.object({
  type: z.literal("builtin"),
  resourceType: BuiltinResourceTypeSchema,
  name: z.string().optional(), // Optional for list operations
  labelSelector: z.string().optional(),
});

// Union schema for all resource targets
export const ResourceTargetSchema = z.union([
  CustomResourceTargetSchema,
  BuiltinResourceTargetSchema,
]);

export type ResourceTarget = z.infer<typeof ResourceTargetSchema>;
export type CustomResourceTarget = z.infer<typeof CustomResourceTargetSchema>;
export type BuiltinResourceTarget = z.infer<typeof BuiltinResourceTargetSchema>;
