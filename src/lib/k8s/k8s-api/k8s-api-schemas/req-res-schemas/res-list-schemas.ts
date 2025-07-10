import { z } from "zod";
import { K8sResourceSchema } from "../resource-schemas/kubernetes-resource-schemas";

// Custom resource list response schema
export const CustomResourceListResponseSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(K8sResourceSchema),
});

// Builtin resource list response schema
export const BuiltinResourceListResponseSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  items: z.array(K8sResourceSchema),
});

// Generic list response schema that can be used for both custom and builtin resources
export const K8sListResponseSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(K8sResourceSchema),
});

// Type exports
export type CustomResourceListResponse = z.infer<
  typeof CustomResourceListResponseSchema
>;
export type BuiltinResourceListResponse = z.infer<
  typeof BuiltinResourceListResponseSchema
>;
export type K8sListResponse = z.infer<typeof K8sListResponseSchema>;
