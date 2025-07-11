import { z } from "zod";

export const ObjectStorageCreateRequestSchema = z.object({
  bucketName: z.string(),
  bucketPolicy: z.enum(["private", "publicRead", "publicReadWrite"]),
});

export const ObjectStorageCreateResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type ObjectStorageCreateRequest = z.infer<
  typeof ObjectStorageCreateRequestSchema
>;
export type ObjectStorageCreateResponse = z.infer<
  typeof ObjectStorageCreateResponseSchema
>;
