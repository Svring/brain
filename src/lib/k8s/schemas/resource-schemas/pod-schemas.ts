import { z } from "zod";
import {
  KubernetesMetadataSchema,
  PodSpecSchema,
} from "./kubernetes-resource-schemas";

// Pod-specific schemas
export const PodConditionSchema = z.object({
  type: z.enum([
    "PodScheduled",
    "Ready",
    "Initialized",
    "ContainersReady",
    "PodReadyCondition",
  ]),
  status: z.enum(["True", "False", "Unknown"]),
  lastProbeTime: z.string().optional(),
  lastTransitionTime: z.string().optional(),
  reason: z.string().optional(),
  message: z.string().optional(),
});

export const ContainerStateSchema = z.object({
  waiting: z
    .object({
      reason: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
  running: z
    .object({
      startedAt: z.string().optional(),
    })
    .optional(),
  terminated: z
    .object({
      exitCode: z.number(),
      signal: z.number().optional(),
      reason: z.string().optional(),
      message: z.string().optional(),
      startedAt: z.string().optional(),
      finishedAt: z.string().optional(),
      containerID: z.string().optional(),
    })
    .optional(),
});

export const ContainerStatusSchema = z.object({
  name: z.string(),
  state: ContainerStateSchema.optional(),
  lastState: ContainerStateSchema.optional(),
  ready: z.boolean(),
  restartCount: z.number(),
  image: z.string(),
  imageID: z.string(),
  containerID: z.string().optional(),
  started: z.boolean().optional(),
});

export const PodStatusSchema = z.object({
  phase: z
    .enum(["Pending", "Running", "Succeeded", "Failed", "Unknown"])
    .optional(),
  conditions: z.array(PodConditionSchema).optional(),
  message: z.string().optional(),
  reason: z.string().optional(),
  nominatedNodeName: z.string().optional(),
  hostIP: z.string().optional(),
  podIP: z.string().optional(),
  podIPs: z
    .array(
      z.object({
        ip: z.string(),
      })
    )
    .optional(),
  startTime: z.string().optional(),
  initContainerStatuses: z.array(ContainerStatusSchema).optional(),
  containerStatuses: z.array(ContainerStatusSchema).optional(),
  qosClass: z.enum(["Guaranteed", "Burstable", "BestEffort"]).optional(),
  ephemeralContainerStatuses: z.array(ContainerStatusSchema).optional(),
});

export const PodResourceSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("Pod"),
  metadata: KubernetesMetadataSchema,
  spec: PodSpecSchema.optional(),
  status: PodStatusSchema.optional(),
});

export const PodListSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("PodList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(PodResourceSchema),
});

// Inferred types for Pod resources
export type PodCondition = z.infer<typeof PodConditionSchema>;
export type ContainerState = z.infer<typeof ContainerStateSchema>;
export type ContainerStatus = z.infer<typeof ContainerStatusSchema>;
export type PodStatus = z.infer<typeof PodStatusSchema>;
export type PodResource = z.infer<typeof PodResourceSchema>;
export type PodList = z.infer<typeof PodListSchema>;
