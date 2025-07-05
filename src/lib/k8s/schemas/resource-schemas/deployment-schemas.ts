import { z } from "zod";
import { KubernetesMetadataSchema } from "./kubernetes-resource-schemas";

// Deployment-specific schemas
export const DeploymentSpecSchema = z.object({
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
    spec: z.record(z.unknown()),
  }),
  strategy: z
    .object({
      type: z.enum(["RollingUpdate", "Recreate"]).optional(),
      rollingUpdate: z
        .object({
          maxUnavailable: z.union([z.string(), z.number()]).optional(),
          maxSurge: z.union([z.string(), z.number()]).optional(),
        })
        .optional(),
    })
    .optional(),
  revisionHistoryLimit: z.number().optional(),
  progressDeadlineSeconds: z.number().optional(),
  paused: z.boolean().optional(),
});

export const DeploymentStatusSchema = z.object({
  observedGeneration: z.number().optional(),
  replicas: z.number().optional(),
  updatedReplicas: z.number().optional(),
  readyReplicas: z.number().optional(),
  availableReplicas: z.number().optional(),
  unavailableReplicas: z.number().optional(),
  conditions: z
    .array(
      z.object({
        type: z.string(),
        status: z.enum(["True", "False", "Unknown"]),
        lastUpdateTime: z.string().optional(),
        lastTransitionTime: z.string().optional(),
        reason: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .optional(),
  collisionCount: z.number().optional(),
});

export const DeploymentResourceSchema = z.object({
  apiVersion: z.literal("apps/v1"),
  kind: z.literal("Deployment"),
  metadata: KubernetesMetadataSchema,
  spec: DeploymentSpecSchema.optional(),
  status: DeploymentStatusSchema.optional(),
});

export const DeploymentListSchema = z.object({
  apiVersion: z.literal("apps/v1"),
  kind: z.literal("DeploymentList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(DeploymentResourceSchema),
});

// Inferred types for Deployment resources
export type DeploymentResource = z.infer<typeof DeploymentResourceSchema>;
export type DeploymentList = z.infer<typeof DeploymentListSchema>;
