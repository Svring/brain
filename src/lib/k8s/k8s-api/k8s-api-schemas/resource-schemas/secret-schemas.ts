import { z } from "zod";
import { K8sMetadataSchema } from "./kubernetes-resource-schemas";

// Secret-specific schemas
export const SecretResourceSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("Secret"),
  metadata: K8sMetadataSchema,
  data: z.record(z.string()).optional(),
  stringData: z.record(z.string()).optional(),
  type: z.string().optional(),
  immutable: z.boolean().optional(),
});

export const SecretListSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("SecretList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(SecretResourceSchema),
});

// Inferred types for Secret resources
export type SecretResource = z.infer<typeof SecretResourceSchema>;
export type SecretList = z.infer<typeof SecretListSchema>;
