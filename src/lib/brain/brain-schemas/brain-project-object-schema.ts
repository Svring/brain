import { z } from "zod";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const BrainResourceSchema = z.object({
  name: z.string(),
  type: z.enum(["app", "database", "oss"]),
  backboneResources: z.object({
    dev: (CustomResourceTargetSchema || BuiltinResourceTargetSchema).optional(),
    prod: (
      CustomResourceTargetSchema || BuiltinResourceTargetSchema
    ).optional(),
  }),
});

export const BrainProjectObjectMetadataSchema = z.object({
  compatibility: z.enum(["desktop", "brain"]),
  resources: z.array(BrainResourceSchema),
});

export const BrainProjectObjectSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  metadata: BrainProjectObjectMetadataSchema,
  createdAt: z.string(),
});
