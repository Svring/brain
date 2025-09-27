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

// Involved object schema for events
export const K8sInvolvedObjectSchema = z.object({
  apiVersion: z.string(),
  fieldPath: z.string().optional(),
  kind: z.string(),
  name: z.string(),
  namespace: z.string().optional(),
  resourceVersion: z.string().optional(),
  uid: z.string().optional(),
});

// Event source schema
export const K8sEventSourceSchema = z.object({
  component: z.string(),
  host: z.string(),
});

// Event-specific schema
export const K8sEventSchema = z.object({
  apiVersion: z.string(),
  count: z.number().optional(),
  eventTime: z.string().nullable().optional(),
  firstTimestamp: z.string().optional(),
  involvedObject: K8sInvolvedObjectSchema,
  kind: z.string(),
  lastTimestamp: z.string().optional(),
  message: z.string().optional(),
  metadata: K8sMetadataSchema,
  reason: z.string().optional(),
  reportingComponent: z.string().optional(),
  reportingInstance: z.string().optional(),
  source: K8sEventSourceSchema.optional(),
  type: z.string().optional(),
});

// Base Kubernetes resource schema
export const K8sResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: K8sMetadataSchema,
  spec: z.record(z.unknown()).optional(),
  status: z.record(z.unknown()).optional(),
  data: z.record(z.unknown()).optional(),
  // Event-specific fields
  count: z.number().optional(),
  eventTime: z.string().nullable().optional(),
  firstTimestamp: z.string().optional(),
  involvedObject: K8sInvolvedObjectSchema.optional(),
  lastTimestamp: z.string().optional(),
  message: z.string().optional(),
  reason: z.string().optional(),
  reportingComponent: z.string().optional(),
  reportingInstance: z.string().optional(),
  source: K8sEventSourceSchema.optional(),
  type: z.string().optional(),
});

// Type exports
export type K8sMetadata = z.infer<typeof K8sMetadataSchema>;
export type K8sResource = z.infer<typeof K8sResourceSchema>;
export type K8sEvent = z.infer<typeof K8sEventSchema>;
export type K8sInvolvedObject = z.infer<typeof K8sInvolvedObjectSchema>;
export type K8sEventSource = z.infer<typeof K8sEventSourceSchema>;
