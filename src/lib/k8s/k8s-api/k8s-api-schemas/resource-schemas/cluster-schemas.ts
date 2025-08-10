import { z } from "zod";
import { K8sMetadataSchema } from "./kubernetes-resource-schemas";

// Cluster ComponentSpec
export const ClusterComponentSpecSchema = z.object({
  componentDefRef: z.string(),
  monitor: z.boolean().optional(),
  name: z.string(),
  noCreatePDB: z.boolean().optional(),
  replicas: z.number().optional(),
  resources: z
    .object({
      limits: z.record(z.string()).optional(),
      requests: z.record(z.string()).optional(),
    })
    .optional(),
  rsmTransformPolicy: z.string().optional(),
  serviceAccountName: z.string().optional(),
  switchPolicy: z
    .object({
      type: z.string(),
    })
    .optional(),
  volumeClaimTemplates: z
    .array(
      z.object({
        name: z.string(),
        spec: z
          .object({
            accessModes: z.array(z.string()).optional(),
            resources: z
              .object({
                requests: z.record(z.string()).optional(),
              })
              .optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

// Cluster Spec
export const ClusterSpecSchema = z.object({
  affinity: z
    .object({
      nodeLabels: z.record(z.string()),
      podAntiAffinity: z.string().optional(),
      tenancy: z.string().optional(),
      topologyKeys: z.array(z.string()).optional(),
    })
    .optional(),
  clusterDefinitionRef: z.string(),
  clusterVersionRef: z.string(),
  componentSpecs: z.array(ClusterComponentSpecSchema),
  terminationPolicy: z.string().optional(),
  tolerations: z.array(z.unknown()).optional(),
});

// Cluster Status
export const ClusterStatusSchema = z.object({
  clusterDefGeneration: z.number().optional(),
  components: z
    .record(
      z.string(),
      z.object({
        phase: z.string().optional(),
        podsReady: z.boolean().optional(),
        podsReadyTime: z.string().optional(),
      })
    )
    .optional(),
  conditions: z
    .array(
      z.object({
        lastTransitionTime: z.string().optional(),
        message: z.string().optional(),
        observedGeneration: z.number().optional(),
        reason: z.string().optional(),
        status: z.string().optional(),
        type: z.string().optional(),
      })
    )
    .optional(),
  observedGeneration: z.number().optional(),
  phase: z.string().optional(),
});

// Cluster Resource
export const ClusterResourceSchema = z.object({
  apiVersion: z.literal("apps.kubeblocks.io/v1alpha1"),
  kind: z.literal("Cluster"),
  metadata: K8sMetadataSchema,
  spec: ClusterSpecSchema,
  status: ClusterStatusSchema.optional(),
});

// Cluster List
export const ClusterListSchema = z.object({
  apiVersion: z.literal("apps.kubeblocks.io/v1alpha1"),
  kind: z.literal("ClusterList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(ClusterResourceSchema),
});

// Inferred types
export type ClusterComponentSpec = z.infer<typeof ClusterComponentSpecSchema>;
export type ClusterSpec = z.infer<typeof ClusterSpecSchema>;
export type ClusterStatus = z.infer<typeof ClusterStatusSchema>;
export type ClusterResource = z.infer<typeof ClusterResourceSchema>;
export type ClusterList = z.infer<typeof ClusterListSchema>;
