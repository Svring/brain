import { z } from "zod";
import { K8sMetadataSchema } from "./kubernetes-resource-schemas";

// PersistentVolumeClaim-specific schemas
export const PersistentVolumeClaimSpecSchema = z.object({
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
});

export const PersistentVolumeClaimConditionSchema = z.object({
  type: z.enum(["Resizing", "FileSystemResizePending"]),
  status: z.enum(["True", "False", "Unknown"]),
  lastProbeTime: z.string().optional(),
  lastTransitionTime: z.string().optional(),
  reason: z.string().optional(),
  message: z.string().optional(),
});

export const PersistentVolumeClaimStatusSchema = z.object({
  phase: z.enum(["Pending", "Bound", "Lost"]).optional(),
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
  capacity: z.record(z.string()).optional(),
  conditions: z.array(PersistentVolumeClaimConditionSchema).optional(),
  allocatedResources: z.record(z.string()).optional(),
  resizeStatus: z
    .enum([
      "ControllerResizeInProgress",
      "NodeResizeInProgress",
      "ControllerResizeFailed",
      "NodeResizeFailed",
    ])
    .optional(),
});

export const PersistentVolumeClaimResourceSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("PersistentVolumeClaim"),
  metadata: K8sMetadataSchema,
  spec: PersistentVolumeClaimSpecSchema.optional(),
  status: PersistentVolumeClaimStatusSchema.optional(),
});

export const PersistentVolumeClaimListSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("PersistentVolumeClaimList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(PersistentVolumeClaimResourceSchema),
});

// Inferred types for PersistentVolumeClaim resources
export type PersistentVolumeClaimSpec = z.infer<
  typeof PersistentVolumeClaimSpecSchema
>;
export type PersistentVolumeClaimCondition = z.infer<
  typeof PersistentVolumeClaimConditionSchema
>;
export type PersistentVolumeClaimStatus = z.infer<
  typeof PersistentVolumeClaimStatusSchema
>;
export type PersistentVolumeClaimResource = z.infer<
  typeof PersistentVolumeClaimResourceSchema
>;
export type PersistentVolumeClaimList = z.infer<
  typeof PersistentVolumeClaimListSchema
>;
