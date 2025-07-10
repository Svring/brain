import { z } from "zod";

/**
 * Base delete response schema with common success indicator
 */
export const BaseDeleteResponseSchema = z.object({
  success: z.boolean(),
});

/**
 * Not found delete response schema for resources that don't exist
 */
export const NotFoundDeleteResponseSchema = BaseDeleteResponseSchema.extend({
  notFound: z.boolean(),
});

/**
 * Standard Kubernetes delete response schema
 */
export const KubernetesDeleteResponseSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.object({
    name: z.string(),
    namespace: z.string().optional(),
    resourceVersion: z.string().optional(),
    uid: z.string().optional(),
    deletionTimestamp: z.string().optional(),
    finalizers: z.array(z.string()).optional(),
    managedFields: z.array(z.unknown()).optional(),
  }),
  status: z
    .object({
      phase: z.string().optional(),
      conditions: z.array(z.unknown()).optional(),
    })
    .optional(),
});

/**
 * Custom resource delete response schema
 */
export const CustomResourceDeleteResponseSchema = z.union([
  KubernetesDeleteResponseSchema,
  NotFoundDeleteResponseSchema,
]);

/**
 * Builtin resource delete response schema
 */
export const BuiltinResourceDeleteResponseSchema = z.union([
  KubernetesDeleteResponseSchema,
  NotFoundDeleteResponseSchema,
]);

/**
 * Bulk delete result for individual resource deletion
 */
export const BulkDeleteResultSchema = z.object({
  success: z.boolean(),
  error: z.unknown().nullable(),
});

/**
 * Bulk delete response schema for label selector deletions
 */
export const BulkDeleteResponseSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number(),
  results: z.array(BulkDeleteResultSchema),
  notFound: z.boolean().optional(),
});

/**
 * Collection delete response schema for builtin resources
 */
export const CollectionDeleteResponseSchema = z.union([
  z.object({
    apiVersion: z.string(),
    kind: z.string(),
    metadata: z
      .object({
        continue: z.string().optional(),
        resourceVersion: z.string().optional(),
      })
      .optional(),
    items: z.array(z.unknown()).optional(),
  }),
  NotFoundDeleteResponseSchema,
]);

/**
 * Metadata removal response schema
 */
export const MetadataRemovalResponseSchema = z.object({
  success: z.boolean(),
  name: z.string(),
  key: z.string(),
});

// Type exports
export type BaseDeleteResponse = z.infer<typeof BaseDeleteResponseSchema>;
export type NotFoundDeleteResponse = z.infer<
  typeof NotFoundDeleteResponseSchema
>;
export type KubernetesDeleteResponse = z.infer<
  typeof KubernetesDeleteResponseSchema
>;
export type CustomResourceDeleteResponse = z.infer<
  typeof CustomResourceDeleteResponseSchema
>;
export type BuiltinResourceDeleteResponse = z.infer<
  typeof BuiltinResourceDeleteResponseSchema
>;
export type BulkDeleteResult = z.infer<typeof BulkDeleteResultSchema>;
export type BulkDeleteResponse = z.infer<typeof BulkDeleteResponseSchema>;
export type CollectionDeleteResponse = z.infer<
  typeof CollectionDeleteResponseSchema
>;
export type MetadataRemovalResponse = z.infer<
  typeof MetadataRemovalResponseSchema
>;
