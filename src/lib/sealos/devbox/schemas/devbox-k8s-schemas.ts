import { z } from "zod";
import { K8sMetadataSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

// Devbox port configuration schema
export const DevboxPortSchema = z.object({
  name: z.string().optional(),
  port: z.number(),
  protocol: z.string(),
  targetPort: z.number().optional(),
  containerPort: z.number().optional(),
});

// Devbox network configuration schema
export const DevboxNetworkSchema = z.object({
  type: z.string(),
  extraPorts: z.array(z.object({
    containerPort: z.number(),
    protocol: z.string(),
  })).optional(),
  nodePort: z.number().optional(),
  tailnet: z.string().optional(),
});

// Devbox resource configuration schema
export const DevboxResourceSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
});

// Devbox config schema
export const DevboxConfigSchema = z.object({
  appPorts: z.array(DevboxPortSchema).optional(),
  ports: z.array(DevboxPortSchema).optional(),
  releaseArgs: z.array(z.string()).optional(),
  releaseCommand: z.array(z.string()).optional(),
  user: z.string().optional(),
  workingDir: z.string().optional(),
});

// Devbox spec schema
export const DevboxSpecSchema = z.object({
  affinity: z.record(z.unknown()).optional(),
  config: DevboxConfigSchema,
  image: z.string(),
  network: DevboxNetworkSchema.optional(),
  resource: DevboxResourceSchema,
  squash: z.boolean().optional(),
  state: z.string(),
  templateID: z.string().optional(),
  tolerations: z.array(z.record(z.unknown())).optional(),
});

// Devbox commit history schema
export const DevboxCommitHistorySchema = z.object({
  containerID: z.string().optional(),
  image: z.string().optional(),
  node: z.string().optional(),
  pod: z.string().optional(),
  predicatedStatus: z.string().optional(),
  status: z.string().optional(),
  time: z.string().optional(),
});

// Devbox status schema
export const DevboxStatusSchema = z.object({
  commitHistory: z.array(DevboxCommitHistorySchema).optional(),
  lastState: z.record(z.unknown()).optional(),
  network: DevboxNetworkSchema.optional(),
  phase: z.string(),
  state: z.object({
    running: z.object({
      startedAt: z.string(),
    }).optional(),
  }).optional(),
});

// Complete Devbox resource schema
export const DevboxResourceK8sSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Devbox"),
  metadata: K8sMetadataSchema,
  spec: DevboxSpecSchema,
  status: DevboxStatusSchema.optional(),
});

// Devbox list schema
export const DevboxListSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("DevboxList"),
  metadata: z.object({
    resourceVersion: z.string().optional(),
    continue: z.string().optional(),
  }).optional(),
  items: z.array(DevboxResourceK8sSchema),
});

// Type exports
export type DevboxPort = z.infer<typeof DevboxPortSchema>;
export type DevboxNetwork = z.infer<typeof DevboxNetworkSchema>;
export type DevboxResource = z.infer<typeof DevboxResourceSchema>;
export type DevboxConfig = z.infer<typeof DevboxConfigSchema>;
export type DevboxSpec = z.infer<typeof DevboxSpecSchema>;
export type DevboxCommitHistory = z.infer<typeof DevboxCommitHistorySchema>;
export type DevboxStatus = z.infer<typeof DevboxStatusSchema>;
export type DevboxResourceK8s = z.infer<typeof DevboxResourceK8sSchema>;
export type DevboxList = z.infer<typeof DevboxListSchema>;