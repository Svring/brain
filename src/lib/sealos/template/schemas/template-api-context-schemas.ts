import { z } from "zod";
import { KubernetesMetadataSchema } from "@/lib/k8s/schemas/resource-schemas/kubernetes-resource-schemas";

export const InstanceApiContextSchema = z.object({
  baseURL: z.string().optional(),
  authorization: z.string().optional(),
});

export type InstanceApiContext = z.infer<typeof InstanceApiContextSchema>;

// Template input schema for form fields
const TemplateInputSchema = z.object({
  description: z.string().optional(),
  type: z.string(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});

// Template spec schema
const TemplateSpecSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  gitRepo: z.string().optional(),
  author: z.string().optional(),
  description: z.string().optional(),
  readme: z.string().optional(),
  icon: z.string().optional(),
  templateType: z.string(),
  locale: z.string().optional(),
  i18n: z
    .record(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        readme: z.string().optional(),
      })
    )
    .optional(),
  categories: z.array(z.string()).optional(),
  defaults: z
    .record(
      z.object({
        type: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  inputs: z.record(TemplateInputSchema).nullable().optional(),
  deployCount: z.number().optional(),
  filePath: z.string().optional(),
  fileName: z.string().optional(),
});

// Template resource schema
const TemplateResourceSchema = z.object({
  apiVersion: z.literal("app.sealos.io/v1"),
  kind: z.literal("Template"),
  metadata: KubernetesMetadataSchema,
  spec: TemplateSpecSchema,
});

// List template response data schema
const ListTemplateDataSchema = z.object({
  templates: z.array(TemplateResourceSchema),
});

// List template response schema
export const ListTemplateResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: ListTemplateDataSchema,
});

// Inferred types
export type TemplateResource = z.infer<typeof TemplateResourceSchema>;
export type ListTemplateResponse = z.infer<typeof ListTemplateResponseSchema>;
