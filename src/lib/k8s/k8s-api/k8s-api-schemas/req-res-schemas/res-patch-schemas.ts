import { z } from "zod";

/**
 * Base patch response schema with common fields
 */
export const BasePatchResponseSchema = z.object({
  success: z.boolean(),
  name: z.string(),
  key: z.string(),
});

/**
 * Metadata patch response schema for annotations or labels
 */
export const MetadataPatchResponseSchema = BasePatchResponseSchema.extend({
  annotations: z.record(z.string()).optional(),
  labels: z.record(z.string()).optional(),
});

/**
 * Custom resource patch response schema
 */
export const CustomResourcePatchResponseSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.object({
    name: z.string(),
    namespace: z.string().optional(),
    annotations: z.record(z.string()).optional(),
    labels: z.record(z.string()).optional(),
    resourceVersion: z.string().optional(),
    uid: z.string().optional(),
    creationTimestamp: z.string().optional(),
    managedFields: z.array(z.unknown()).optional(),
  }),
  spec: z.unknown().optional(),
  status: z.unknown().optional(),
});

/**
 * Builtin resource patch response schema
 */
export const BuiltinResourcePatchResponseSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.object({
    name: z.string(),
    namespace: z.string().optional(),
    annotations: z.record(z.string()).optional(),
    labels: z.record(z.string()).optional(),
    resourceVersion: z.string().optional(),
    uid: z.string().optional(),
    creationTimestamp: z.string().optional(),
    managedFields: z.array(z.unknown()).optional(),
  }),
  spec: z.unknown().optional(),
  status: z.unknown().optional(),
});

/**
 * YAML apply response schema for instance resources
 */
export const YamlApplyResponseSchema = z.object({
  action: z.enum(["created", "updated"]),
  resource: z.union([
    CustomResourcePatchResponseSchema,
    BuiltinResourcePatchResponseSchema,
  ]),
});

// Type exports
export type BasePatchResponse = z.infer<typeof BasePatchResponseSchema>;
export type MetadataPatchResponse = z.infer<typeof MetadataPatchResponseSchema>;
export type CustomResourcePatchResponse = z.infer<
  typeof CustomResourcePatchResponseSchema
>;
export type BuiltinResourcePatchResponse = z.infer<
  typeof BuiltinResourcePatchResponseSchema
>;
export type YamlApplyResponse = z.infer<typeof YamlApplyResponseSchema>;
