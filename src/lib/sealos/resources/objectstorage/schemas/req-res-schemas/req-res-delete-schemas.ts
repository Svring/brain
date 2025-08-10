import { z } from "zod";

export const ObjectStorageDeleteRequestSchema = z.object({
  bucketName: z.string(),
});

export const ObjectStorageDeleteResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type ObjectStorageDeleteRequest = z.infer<
  typeof ObjectStorageDeleteRequestSchema
>;
export type ObjectStorageDeleteResponse = z.infer<
  typeof ObjectStorageDeleteResponseSchema
>;
