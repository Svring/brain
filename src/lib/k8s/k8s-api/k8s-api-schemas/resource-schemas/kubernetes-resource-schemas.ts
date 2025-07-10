import { z } from "zod";

// Base Kubernetes metadata schema
export const K8sMetadataSchema = z.object({
  name: z.string(),
  namespace: z.string().optional(),
  uid: z.string().optional(),
  resourceVersion: z.string().optional(),
  generation: z.number().optional(),
  creationTimestamp: z.string().optional(),
  deletionTimestamp: z.string().optional(),
  labels: z.record(z.string()).optional(),
  annotations: z.record(z.string()).optional(),
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
  finalizers: z.array(z.string()).optional(),
});

// Base Kubernetes resource schema
export const K8sResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: K8sMetadataSchema,
  spec: z.record(z.unknown()).optional(),
  status: z.record(z.unknown()).optional(),
});

// Type exports
export type K8sMetadata = z.infer<typeof K8sMetadataSchema>;
export type K8sResource = z.infer<typeof K8sResourceSchema>;
