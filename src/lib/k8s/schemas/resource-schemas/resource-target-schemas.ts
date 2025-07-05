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
]);

export const BuiltinResourceTargetSchema = z.object({
  type: BuiltinResourceKindSchema,
  namespace: z.string(),
  name: z.string(),
});

// Union type for all resource targets
export const ResourceTargetSchema = z.discriminatedUnion("type", [
  CustomResourceTargetSchema,
  BuiltinResourceTargetSchema,
]);

// Inferred types for resource targets
export type CustomResourceTarget = z.infer<typeof CustomResourceTargetSchema>;
export type BuiltinResourceTarget = z.infer<typeof BuiltinResourceTargetSchema>;
// Backwards-compat alias for existing "deployment" only type
export type DeploymentTarget = BuiltinResourceTarget;
export type ResourceTarget = z.infer<typeof ResourceTargetSchema>;
