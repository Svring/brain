import { z } from "zod";
import { KubernetesMetadataSchema } from "./kubernetes-resource-schemas";

// Instance spec property schema
const InstanceSpecDefaultsSchema = z.record(
  z.object({
    type: z.string(),
    value: z.string(),
  })
);

export const InstanceSpecSchema = z.object({
  templateType: z.string(),
  defaults: InstanceSpecDefaultsSchema,
  title: z.string(),
  author: z.string().optional(),
  url: z.string().optional(),
  readme: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  draft: z.boolean().optional(),
  gitRepo: z.string().optional(),
  categories: z.array(z.string()).optional(),
  inputs: z.record(z.unknown()).optional(),
});

export const InstanceResourceSchema = z.object({
  apiVersion: z.literal("app.sealos.io/v1"),
  kind: z.literal("Instance"),
  metadata: KubernetesMetadataSchema,
  spec: InstanceSpecSchema,
  status: z.record(z.unknown()).optional(),
});

export const InstanceListSchema = z.object({
  apiVersion: z.literal("app.sealos.io/v1"),
  kind: z.literal("InstanceList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(InstanceResourceSchema),
});

// Inferred types for Instance resources
export type InstanceResource = z.infer<typeof InstanceResourceSchema>;
export type InstanceList = z.infer<typeof InstanceListSchema>;
