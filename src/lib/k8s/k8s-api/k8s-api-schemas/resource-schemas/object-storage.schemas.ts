import { z } from "zod";
import { K8sMetadataSchema } from "./kubernetes-resource-schemas";

export const ObjectStorageBucketSpecSchema = z.object({
  policy: z.string(),
});

export const ObjectStorageBucketStatusSchema = z.object({
  name: z.string(),
});

export const ObjectStorageBucketSchema = z.object({
  apiVersion: z.literal("objectstorage.sealos.io/v1"),
  kind: z.literal("ObjectStorageBucket"),
  metadata: K8sMetadataSchema,
  spec: ObjectStorageBucketSpecSchema,
  status: ObjectStorageBucketStatusSchema.optional(),
});

export type ObjectStorageBucket = z.infer<typeof ObjectStorageBucketSchema>;
