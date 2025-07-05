import { z } from "zod";
import {
  KubernetesMetadataSchema,
  PodSpecSchema,
} from "./kubernetes-resource-schemas";

// StatefulSet-specific schemas
export const PersistentVolumeClaimTemplateSchema = z.object({
  metadata: KubernetesMetadataSchema.optional(),
  spec: z.object({
    accessModes: z
      .array(
        z.enum([
          "ReadWriteOnce",
          "ReadOnlyMany",
          "ReadWriteMany",
          "ReadWriteOncePod",
        ])
      )
      .optional(),
    selector: z
      .object({
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
      })
      .optional(),
    resources: z
      .object({
        limits: z.record(z.string()).optional(),
        requests: z.record(z.string()).optional(),
      })
      .optional(),
    volumeName: z.string().optional(),
    storageClassName: z.string().optional(),
    volumeMode: z.enum(["Filesystem", "Block"]).optional(),
    dataSource: z
      .object({
        name: z.string(),
        kind: z.string(),
        apiGroup: z.string().optional(),
      })
      .optional(),
    dataSourceRef: z
      .object({
        name: z.string(),
        kind: z.string(),
        apiGroup: z.string().optional(),
        namespace: z.string().optional(),
      })
      .optional(),
  }),
  status: z.record(z.unknown()).optional(),
});

export const StatefulSetSpecSchema = z.object({
  replicas: z.number().optional(),
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
  volumeClaimTemplates: z.array(PersistentVolumeClaimTemplateSchema).optional(),
  serviceName: z.string(),
  podManagementPolicy: z.enum(["OrderedReady", "Parallel"]).optional(),
  updateStrategy: z
    .object({
      type: z.enum(["RollingUpdate", "OnDelete"]).optional(),
      rollingUpdate: z
        .object({
          partition: z.number().optional(),
          maxUnavailable: z.union([z.string(), z.number()]).optional(),
        })
        .optional(),
    })
    .optional(),
  revisionHistoryLimit: z.number().optional(),
  minReadySeconds: z.number().optional(),
  persistentVolumeClaimRetentionPolicy: z
    .object({
      whenDeleted: z.enum(["Retain", "Delete"]).optional(),
      whenScaled: z.enum(["Retain", "Delete"]).optional(),
    })
    .optional(),
  ordinals: z
    .object({
      start: z.number().optional(),
    })
    .optional(),
});

export const StatefulSetStatusSchema = z.object({
  observedGeneration: z.number().optional(),
  replicas: z.number().optional(),
  readyReplicas: z.number().optional(),
  currentReplicas: z.number().optional(),
  updatedReplicas: z.number().optional(),
  currentRevision: z.string().optional(),
  updateRevision: z.string().optional(),
  collisionCount: z.number().optional(),
  conditions: z
    .array(
      z.object({
        type: z.string(),
        status: z.enum(["True", "False", "Unknown"]),
        lastTransitionTime: z.string().optional(),
        reason: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .optional(),
  availableReplicas: z.number().optional(),
});

export const StatefulSetResourceSchema = z.object({
  apiVersion: z.literal("apps/v1"),
  kind: z.literal("StatefulSet"),
  metadata: KubernetesMetadataSchema,
  spec: StatefulSetSpecSchema.optional(),
  status: StatefulSetStatusSchema.optional(),
});

export const StatefulSetListSchema = z.object({
  apiVersion: z.literal("apps/v1"),
  kind: z.literal("StatefulSetList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(StatefulSetResourceSchema),
});

// Inferred types for StatefulSet resources
export type PersistentVolumeClaimTemplate = z.infer<
  typeof PersistentVolumeClaimTemplateSchema
>;
export type StatefulSetSpec = z.infer<typeof StatefulSetSpecSchema>;
export type StatefulSetStatus = z.infer<typeof StatefulSetStatusSchema>;
export type StatefulSetResource = z.infer<typeof StatefulSetResourceSchema>;
export type StatefulSetList = z.infer<typeof StatefulSetListSchema>;
