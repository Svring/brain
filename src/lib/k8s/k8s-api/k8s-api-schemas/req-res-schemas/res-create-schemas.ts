import { z } from "zod";

/**
 * Base creation response schema with common fields
 */
export const BaseCreateResponseSchema = z.object({
  success: z.boolean(),
  action: z.literal("created"),
  name: z.string(),
});

/**
 * Custom resource creation response schema
 */
export const CustomResourceCreateResponseSchema = z.object({
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
 * Builtin resource creation response schema
 */
export const BuiltinResourceCreateResponseSchema = z.object({
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
 * YAML apply creation response schema
 */
export const YamlApplyCreateResponseSchema = z.object({
  action: z.enum(["created", "updated"]),
  resource: z.union([
    CustomResourceCreateResponseSchema,
    BuiltinResourceCreateResponseSchema,
  ]),
});

/**
 * Bulk creation response schema
 */
export const BulkCreateResponseSchema = z.object({
  success: z.boolean(),
  createdCount: z.number(),
  results: z.array(
    z.object({
      success: z.boolean(),
      name: z.string(),
      error: z.string().optional(),
    })
  ),
});

// Type exports
export type BaseCreateResponse = z.infer<typeof BaseCreateResponseSchema>;
export type CustomResourceCreateResponse = z.infer<
  typeof CustomResourceCreateResponseSchema
>;
export type BuiltinResourceCreateResponse = z.infer<
  typeof BuiltinResourceCreateResponseSchema
>;
export type YamlApplyCreateResponse = z.infer<
  typeof YamlApplyCreateResponseSchema
>;
export type BulkCreateResponse = z.infer<typeof BulkCreateResponseSchema>;
