import { z } from "zod";

// ===== REQUEST SCHEMAS =====

// Create instance request body schema
export const CreateInstanceRequestSchema = z.object({
  templateName: z.string(),
  templateForm: z.record(z.string()).optional(),
});

// ===== RESPONSE SCHEMAS =====

// Kubernetes object metadata schema (what gets returned from K8s API)
const K8sMetadataSchema = z.object({
  name: z.string(),
  namespace: z.string().optional(),
  uid: z.string().optional(),
  resourceVersion: z.string().optional(),
  creationTimestamp: z.string().optional(),
  labels: z.record(z.string()).optional(),
  annotations: z.record(z.string()).optional(),
  generation: z.number().optional(),
  managedFields: z.array(z.unknown()).optional(),
});

// Base Kubernetes object schema (what applyYamlList returns)
const KubernetesObjectSchema = z
  .object({
    apiVersion: z.string(),
    kind: z.string(),
    metadata: K8sMetadataSchema,
    spec: z.record(z.unknown()).optional(),
    status: z.record(z.unknown()).optional(),
    // Allow additional properties since K8s objects can have various fields
  })
  .passthrough();

// Success response schema
export const CreateInstanceSuccessResponseSchema = z.object({
  code: z.literal(200),
  message: z.string().optional(),
  data: z.array(KubernetesObjectSchema),
});

// Error response schema
const CreateInstanceErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  error: z.unknown().optional(),
});

// Combined response schema
export const CreateInstanceResponseSchema = z.union([
  CreateInstanceSuccessResponseSchema,
  CreateInstanceErrorResponseSchema,
]);

// ===== INFERRED TYPES =====
export type CreateInstanceRequest = z.infer<typeof CreateInstanceRequestSchema>;
export type CreateInstanceSuccessResponse = z.infer<
  typeof CreateInstanceSuccessResponseSchema
>;
export type CreateInstanceErrorResponse = z.infer<
  typeof CreateInstanceErrorResponseSchema
>;
export type CreateInstanceResponse = z.infer<
  typeof CreateInstanceResponseSchema
>;
export type KubernetesObject = z.infer<typeof KubernetesObjectSchema>;
