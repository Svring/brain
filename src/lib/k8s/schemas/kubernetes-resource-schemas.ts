import { z } from "zod";

// Kubernetes resource schemas
export const KubernetesMetadataSchema = z.object({
  name: z.string(),
  namespace: z.string().optional(),
  labels: z.record(z.string()).optional(),
  annotations: z.record(z.string()).optional(),
  uid: z.string().optional(),
  resourceVersion: z.string().optional(),
  generation: z.number().optional(),
  creationTimestamp: z.string().optional(),
  deletionTimestamp: z.string().optional(),
  finalizers: z.array(z.string()).optional(),
  ownerReferences: z
    .array(
      z.object({
        apiVersion: z.string(),
        kind: z.string(),
        name: z.string(),
        uid: z.string(),
        controller: z.boolean().optional(),
        blockOwnerDeletion: z.boolean().optional(),
      })
    )
    .optional(),
});

export const KubernetesResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: KubernetesMetadataSchema,
  spec: z.record(z.unknown()).optional(),
  status: z.record(z.unknown()).optional(),
});

export const KubernetesListSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(KubernetesResourceSchema),
});

// Inferred types for Kubernetes resources
export type KubernetesMetadata = z.infer<typeof KubernetesMetadataSchema>;
export type KubernetesResource = z.infer<typeof KubernetesResourceSchema>;
export type KubernetesList = z.infer<typeof KubernetesListSchema>;
