import { z } from "zod";
import {
  BuiltinResourceKindSchema,
  ResourceTargetSchema,
} from "./resource-schemas/resource-target-schemas";

// Input parameter schemas for queries (namespace is in context)
export const ListCustomResourceRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  plural: z.string(),
  labelSelector: z.string().optional(),
});

export const GetCustomResourceRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  plural: z.string(),
  name: z.string(),
});

// Generalized builtin resource schemas
export const ListBuiltinResourceRequestSchema = z.object({
  resourceType: BuiltinResourceKindSchema,
  labelSelector: z.string().optional(),
});

export const GetBuiltinResourceRequestSchema = z.object({
  resourceType: BuiltinResourceKindSchema,
  name: z.string(),
});

// Legacy specific resource schemas (for backwards compatibility)
export const ListServicesRequestSchema = z.object({
  labelSelector: z.string().optional(),
});

export const GetServiceRequestSchema = z.object({
  name: z.string(),
});

export const ListIngressesRequestSchema = z.object({
  labelSelector: z.string().optional(),
});

export const GetIngressRequestSchema = z.object({
  name: z.string(),
});

export const ListAllResourcesRequestSchema = z.object({
  labelSelector: z.string().optional(),
});

// Input parameter schemas for mutations (namespace is in context)
export const PatchCustomResourceRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  plural: z.string(),
  name: z.string(),
  patchBody: z.array(z.unknown()),
});

export const PatchCustomResourceMetadataRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  plural: z.string(),
  name: z.string(),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
  value: z.string(),
});

export const RemoveCustomResourceMetadataRequestSchema = z.object({
  group: z.string(),
  version: z.string(),
  plural: z.string(),
  name: z.string(),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
});

// Generalized builtin resource mutation schemas
export const PatchBuiltinResourceMetadataRequestSchema = z.object({
  resourceType: BuiltinResourceKindSchema,
  name: z.string(),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
  value: z.string(),
});

export const RemoveBuiltinResourceMetadataRequestSchema = z.object({
  resourceType: BuiltinResourceKindSchema,
  name: z.string(),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
});

// Batch operation schemas
export const BatchPatchRequestSchema = z.object({
  resources: z.array(ResourceTargetSchema),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
  value: z.string(),
});

export const BatchRemoveRequestSchema = z.object({
  resources: z.array(ResourceTargetSchema),
  metadataType: z.enum(["annotations", "labels"]),
  key: z.string(),
});

// Inferred types for input parameters
export type ListCustomResourceRequest = z.infer<
  typeof ListCustomResourceRequestSchema
>;
export type GetCustomResourceRequest = z.infer<
  typeof GetCustomResourceRequestSchema
>;

// Generalized builtin resource types
export type ListBuiltinResourceRequest = z.infer<
  typeof ListBuiltinResourceRequestSchema
>;
export type GetBuiltinResourceRequest = z.infer<
  typeof GetBuiltinResourceRequestSchema
>;
export type PatchBuiltinResourceMetadataRequest = z.infer<
  typeof PatchBuiltinResourceMetadataRequestSchema
>;
export type RemoveBuiltinResourceMetadataRequest = z.infer<
  typeof RemoveBuiltinResourceMetadataRequestSchema
>;

// Legacy specific resource types (for backwards compatibility)
export type ListServicesRequest = z.infer<typeof ListServicesRequestSchema>;
export type GetServiceRequest = z.infer<typeof GetServiceRequestSchema>;
export type ListIngressesRequest = z.infer<typeof ListIngressesRequestSchema>;
export type GetIngressRequest = z.infer<typeof GetIngressRequestSchema>;
export type ListAllResourcesRequest = z.infer<
  typeof ListAllResourcesRequestSchema
>;
export type PatchCustomResourceRequest = z.infer<
  typeof PatchCustomResourceRequestSchema
>;
export type PatchCustomResourceMetadataRequest = z.infer<
  typeof PatchCustomResourceMetadataRequestSchema
>;
export type RemoveCustomResourceMetadataRequest = z.infer<
  typeof RemoveCustomResourceMetadataRequestSchema
>;
export type BatchPatchRequest = z.infer<typeof BatchPatchRequestSchema>;
export type BatchRemoveRequest = z.infer<typeof BatchRemoveRequestSchema>;
