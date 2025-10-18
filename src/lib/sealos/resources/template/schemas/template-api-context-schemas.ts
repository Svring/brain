import { z } from "zod";
import { K8sMetadataSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

// =====================
// 1. API Context Schema
// =====================
export const TemplateApiContextSchema = z.object({
  baseUrl: z.string().optional(),
  authorization: z.string().optional(),
});

export type TemplateApiContext = z.infer<typeof TemplateApiContextSchema>;

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
  metadata: K8sMetadataSchema,
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

const RequirementsSchema = z.object({
  cpu: z.object({
    min: z.number(),
    max: z.number(),
  }),
  memory: z.object({
    min: z.number(),
    max: z.number(),
  }),
  storage: z.object({
    min: z.number(),
    max: z.number(),
  }),
  nodeport: z.number(),
});

// Template source data schema (the actual response data structure)
const TemplateSourceDataSchema = z.object({
  source: SourceSchema,
  appYaml: z.string(),
  templateYaml: TemplateYamlSchema,
  readmeContent: z.string().optional(),
  readUrl: z.string().optional(),
  requirements: RequirementsSchema.optional(),
});

// Template source response schema
export const TemplateSourceResponseSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  data: TemplateSourceDataSchema,
});

// =============================
// 4. New Template Schemas (v1 API)
// =============================

// Template resource schema for requirements (v1 API)
export const TemplateResourceSchemaV1 = z.object({
	cpu: z.number(),
	memory: z.number(),
	storage: z.number(),
	nodeport: z.number(),
});

// Template input schema for form fields (v1 API)
export const TemplateInputSchemaV1 = z.object({
	description: z.string(),
	type: z.string(),
	default: z.string(),
	required: z.boolean(),
});

// Template object schema (v1 API - full template details)
export const TemplateObjectSchemaV1 = z.object({
	name: z.string(),
	resourceType: z.literal("template"),
	resource: TemplateResourceSchemaV1,
	readme: z.string().url(),
	icon: z.string().url(),
	description: z.string(),
	gitRepo: z.string().url(),
	category: z.array(z.string()),
	input: z.record(z.string(), TemplateInputSchemaV1),
	deployCount: z.number(),
});

// Template item schema (v1 API - for list view)
export const TemplateItemSchemaV1 = TemplateObjectSchemaV1.omit({ resource: true });

// Template response schema (v1 API)
export const TemplateResponseSchemaV1 = z.object({
	code: z.number(),
	message: z.string().optional(),
	data: TemplateObjectSchemaV1,
});

// =============================
// 5. Type Exports
// =============================
// Existing types
export type TemplateResource = z.infer<typeof TemplateResourceSchema>;
export type ListTemplateResponse = z.infer<typeof ListTemplateResponseSchema>;
export type FormSourceInput = z.infer<typeof FormSourceInputSchema>;
export type TemplateSourceDefault = z.infer<typeof TemplateSourceDefaultSchema>;
export type EnvResponse = z.infer<typeof EnvResponseSchema>;
export type TemplateYaml = z.infer<typeof TemplateYamlSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type Requirements = z.infer<typeof RequirementsSchema>;
export type TemplateSourceData = z.infer<typeof TemplateSourceDataSchema>;
export type TemplateSourceResponse = z.infer<
  typeof TemplateSourceResponseSchema
>;

// New v1 API types
export type TemplateResourceV1 = z.infer<typeof TemplateResourceSchemaV1>;
export type TemplateInputV1 = z.infer<typeof TemplateInputSchemaV1>;
export type TemplateObjectV1 = z.infer<typeof TemplateObjectSchemaV1>;
export type TemplateItemV1 = z.infer<typeof TemplateItemSchemaV1>;
export type TemplateResponseV1 = z.infer<typeof TemplateResponseSchemaV1>;
