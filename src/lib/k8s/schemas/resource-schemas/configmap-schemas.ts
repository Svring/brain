import { z } from "zod";
import { KubernetesMetadataSchema } from "./kubernetes-resource-schemas";

// ConfigMap-specific schemas
export const ConfigMapResourceSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("ConfigMap"),
  metadata: KubernetesMetadataSchema,
  data: z.record(z.string()).optional(),
  binaryData: z.record(z.string()).optional(),
  immutable: z.boolean().optional(),
});

export const ConfigMapListSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("ConfigMapList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(ConfigMapResourceSchema),
});

// Inferred types for ConfigMap resources
export type ConfigMapResource = z.infer<typeof ConfigMapResourceSchema>;
export type ConfigMapList = z.infer<typeof ConfigMapListSchema>;
