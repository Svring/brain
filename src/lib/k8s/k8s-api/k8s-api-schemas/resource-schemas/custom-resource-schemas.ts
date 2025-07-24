import { z } from "zod";
import { K8sMetadataSchema } from "./kubernetes-resource-schemas";

// Custom resource schemas (generic structure)
export const CustomResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: K8sMetadataSchema,
  spec: z.record(z.unknown()).optional(),
  status: z.record(z.unknown()).optional(),
});

export const CustomResourceListSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(CustomResourceSchema),
});

// Inferred types for Custom resources
export type CustomResource = z.infer<typeof CustomResourceSchema>;
export type CustomResourceList = z.infer<typeof CustomResourceListSchema>;
