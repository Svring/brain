import { z } from "zod";
import {
  KubernetesMetadataSchema,
  PodSpecSchema,
} from "./kubernetes-resource-schemas";

// DaemonSet-specific schemas
export const DaemonSetSpecSchema = z.object({
  selector: z.object({
    matchLabels: z.record(z.string()).optional(),
    matchExpressions: z
      .array(
        z.object({
          key: z.string(),
          operator: z.enum(["In", "NotIn", "Exists", "DoesNotExist"]),
          values: z.array(z.string()).optional(),
        })
      )
      .optional(),
  }),
  template: z.object({
    metadata: KubernetesMetadataSchema.optional(),
    spec: PodSpecSchema,
  }),
  updateStrategy: z
    .object({
      type: z.enum(["RollingUpdate", "OnDelete"]).optional(),
      rollingUpdate: z
        .object({
          maxUnavailable: z.union([z.string(), z.number()]).optional(),
          maxSurge: z.union([z.string(), z.number()]).optional(),
        })
        .optional(),
    })
    .optional(),
  minReadySeconds: z.number().optional(),
  revisionHistoryLimit: z.number().optional(),
});

export const DaemonSetConditionSchema = z.object({
  type: z.string(),
  status: z.enum(["True", "False", "Unknown"]),
  lastTransitionTime: z.string().optional(),
  reason: z.string().optional(),
  message: z.string().optional(),
});

export const DaemonSetStatusSchema = z.object({
  currentNumberScheduled: z.number(),
  numberMisscheduled: z.number(),
  desiredNumberScheduled: z.number(),
  numberReady: z.number(),
  observedGeneration: z.number().optional(),
  updatedNumberScheduled: z.number().optional(),
  numberAvailable: z.number().optional(),
  numberUnavailable: z.number().optional(),
  collisionCount: z.number().optional(),
  conditions: z.array(DaemonSetConditionSchema).optional(),
});

export const DaemonSetResourceSchema = z.object({
  apiVersion: z.literal("apps/v1"),
  kind: z.literal("DaemonSet"),
  metadata: KubernetesMetadataSchema,
  spec: DaemonSetSpecSchema.optional(),
  status: DaemonSetStatusSchema.optional(),
});

export const DaemonSetListSchema = z.object({
  apiVersion: z.literal("apps/v1"),
  kind: z.literal("DaemonSetList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(DaemonSetResourceSchema),
});

// Inferred types for DaemonSet resources
export type DaemonSetSpec = z.infer<typeof DaemonSetSpecSchema>;
export type DaemonSetCondition = z.infer<typeof DaemonSetConditionSchema>;
export type DaemonSetStatus = z.infer<typeof DaemonSetStatusSchema>;
export type DaemonSetResource = z.infer<typeof DaemonSetResourceSchema>;
export type DaemonSetList = z.infer<typeof DaemonSetListSchema>;
