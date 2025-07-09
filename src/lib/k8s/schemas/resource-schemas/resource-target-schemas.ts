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

// Supported built-in Kubernetes resource kinds
export const BuiltinResourceKindSchema = z.enum([
  "deployment",
  "service",
  "ingress",
  "statefulset",
  "daemonset",
  "configmap",
  "secret",
  "pod",
  "pvc",
  "horizontalpodautoscaler",
  "role",
  "rolebinding",
  "serviceaccount",
  "job",
  "cronjob",
]);

export const BuiltinResourceTargetSchema = z.object({
  type: BuiltinResourceKindSchema,
  namespace: z.string(),
  name: z.string(),
});

// Type targets (used for LIST queries) ------------------------------------

// Custom resource type target: identifies a list of custom resources (no name)
export const CustomResourceTypeTargetSchema = z.object({
  type: z.literal("custom"),
  group: z.string(),
  version: z.string(),
  namespace: z.string(),
  plural: z.string(),
  labelSelector: z.string().optional(),
});

// Built-in resource type target: identifies a list of built-in resources (no name)
export const BuiltinResourceTypeTargetSchema = z.object({
  type: BuiltinResourceKindSchema,
  namespace: z.string(),
  labelSelector: z.string().optional(),
});

// Union for all type targets (list queries)
export const ResourceTypeTargetSchema = z.union([
  CustomResourceTypeTargetSchema,
  BuiltinResourceTypeTargetSchema,
]);

// Union type for all resource targets
export const ResourceTargetSchema = z.union([
  CustomResourceTargetSchema,
  BuiltinResourceTargetSchema,
]);

// Inferred types for resource targets
export type CustomResourceTarget = z.infer<typeof CustomResourceTargetSchema>;
export type BuiltinResourceTarget = z.infer<typeof BuiltinResourceTargetSchema>;
export type CustomResourceTypeTarget = z.infer<
  typeof CustomResourceTypeTargetSchema
>;
export type BuiltinResourceTypeTarget = z.infer<
  typeof BuiltinResourceTypeTargetSchema
>;

export type ResourceTarget = z.infer<typeof ResourceTargetSchema>;
export type ResourceTypeTarget = z.infer<typeof ResourceTypeTargetSchema>;
