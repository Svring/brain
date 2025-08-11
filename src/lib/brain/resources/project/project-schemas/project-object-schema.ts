import { z } from "zod";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const ProjectResourceSchema = z.object({
  name: z.string(),
  type: z.enum(["app", "database", "oss"]),
  backboneResources: z.object({
    dev: (CustomResourceTargetSchema || BuiltinResourceTargetSchema).optional(),
    prod: (
      CustomResourceTargetSchema || BuiltinResourceTargetSchema
    ).optional(),
  }),
  dependencies: z
    .object({
      envString: z.string().optional(),
      envVariables: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
});

export const ProjectObjectMetadataSchema = z.object({
  compatibility: z.enum(["desktop", "brain"]),
  resources: z.array(ProjectResourceSchema),
});

export const ProjectObjectSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  metadata: ProjectObjectMetadataSchema,
  createdAt: z.string(),
});

export type ProjectObject = z.infer<typeof ProjectObjectSchema>;

export type ProjectObjectMetadata = z.infer<typeof ProjectObjectMetadataSchema>;

export type ProjectObjectResource = z.infer<
  typeof ProjectObjectSchema.shape.metadata.shape.resources
>;
