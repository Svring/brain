import { z } from "zod";
import { KubernetesMetadataSchema } from "@/lib/k8s/schemas/resource-schemas/kubernetes-resource-schemas";

// =====================
// 1. API Context Schema
// =====================
export const InstanceApiContextSchema = z.object({
  baseURL: z.string().optional(),
  authorization: z.string().optional(),
});

export type InstanceApiContext = z.infer<typeof InstanceApiContextSchema>;

// =============================
// 2. Template Resource (List)
// =============================
// Template input schema for form fields (used in template list)
const TemplateInputSchema = z.object({
  description: z.string().optional(),
  type: z.string(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});

// Template spec schema (used in template list)
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

// Template resource schema (used in template list)
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

// =============================
// 3. Template Source (Detail)
// =============================
// Form source input schema (used in template source detail)
const FormSourceInputSchema = z.object({
  description: z.string(),
  type: z.string(),
  default: z.string(),
  required: z.boolean(),
  key: z.string(),
  label: z.string(),
  options: z.array(z.string()).optional(),
  if: z.string().optional(),
});

// Template source default schema
const TemplateSourceDefaultSchema = z.object({
  type: z.string(),
  value: z.string(),
});

// Environment response schema (exact platform envs)
const EnvResponseSchema = z.object({
  FORCED_LANGUAGE: z.string(),
  SEALOS_CLOUD_DOMAIN: z.string(),
  SEALOS_CERT_SECRET_NAME: z.string(),
  TEMPLATE_REPO_URL: z.string(),
  TEMPLATE_REPO_BRANCH: z.string(),
  SEALOS_NAMESPACE: z.string(),
  SEALOS_SERVICE_ACCOUNT: z.string(),
  SHOW_AUTHOR: z.string(),
  DESKTOP_DOMAIN: z.string(),
  CURRENCY_SYMBOL: z.enum(["shellCoin", "cny", "usd"]),
});

// Template metadata schema (for templateYaml)
const TemplateMetadataSchema = z.object({
  name: z.string(),
});

// Template spec input schema (for templateYaml)
const TemplateSpecInputSchema = z.object({
  description: z.string(),
  type: z.string(),
  default: z.string(),
  required: z.boolean(),
});

// Template spec schema (for templateYaml)
const TemplateSpecDetailSchema = z.object({
  fileName: z.string(),
  filePath: z.string(),
  deployCount: z.number().optional(),
  categories: z.array(z.string()).optional(),
  templateType: z.literal("inline"),
  gitRepo: z.string(),
  template_type: z.string().optional(),
  author: z.string(),
  title: z.string(),
  url: z.string(),
  readme: z.string(),
  icon: z.string(),
  description: z.string(),
  draft: z.boolean(),
  defaults: z.record(TemplateSourceDefaultSchema).optional(),
  inputs: z.record(TemplateSpecInputSchema).optional(),
  locale: z.string().optional(),
  i18n: z.record(z.record(z.string())).optional(),
});

// Template YAML schema (the full template CRD)
const TemplateYamlSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: TemplateMetadataSchema,
  spec: TemplateSpecDetailSchema,
});

// Source schema (combination of processed template data and environment variables)
const SourceSchema = z.object({
  defaults: z.record(TemplateSourceDefaultSchema),
  inputs: z.array(FormSourceInputSchema),
  FORCED_LANGUAGE: z.string(),
  SEALOS_CLOUD_DOMAIN: z.string(),
  SEALOS_CERT_SECRET_NAME: z.string(),
  TEMPLATE_REPO_URL: z.string(),
  TEMPLATE_REPO_BRANCH: z.string(),
  SEALOS_NAMESPACE: z.string(),
  SEALOS_SERVICE_ACCOUNT: z.string(),
  SHOW_AUTHOR: z.string(),
  DESKTOP_DOMAIN: z.string(),
  CURRENCY_SYMBOL: z.enum(["shellCoin", "cny", "usd"]),
});

// Template source data schema (the actual response data structure)
const TemplateSourceDataSchema = z.object({
  source: SourceSchema,
  appYaml: z.string(),
  templateYaml: TemplateYamlSchema,
  readmeContent: z.string().optional(),
  readUrl: z.string().optional(),
});

// Template source response schema
export const TemplateSourceResponseSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  data: TemplateSourceDataSchema,
});

// =============================
// 4. Type Exports
// =============================
export type TemplateResource = z.infer<typeof TemplateResourceSchema>;
export type ListTemplateResponse = z.infer<typeof ListTemplateResponseSchema>;
export type FormSourceInput = z.infer<typeof FormSourceInputSchema>;
export type TemplateSourceDefault = z.infer<typeof TemplateSourceDefaultSchema>;
export type EnvResponse = z.infer<typeof EnvResponseSchema>;
export type TemplateYaml = z.infer<typeof TemplateYamlSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type TemplateSourceData = z.infer<typeof TemplateSourceDataSchema>;
export type TemplateSourceResponse = z.infer<
  typeof TemplateSourceResponseSchema
>;
