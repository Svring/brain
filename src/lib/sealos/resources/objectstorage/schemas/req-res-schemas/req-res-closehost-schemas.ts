import { z } from "zod";

export const ObjectStorageCloseHostRequestSchema = z.object({
  bucket: z.string(),
});

export const ObjectStorageCloseHostResponseSchema = z.object({
  code: z.number(),
  statusText: z.string(),
  message: z.string(),
  data: z.any().nullable(),
});

export type ObjectStorageCloseHostRequest = z.infer<
  typeof ObjectStorageCloseHostRequestSchema
>;
export type ObjectStorageCloseHostResponse = z.infer<
  typeof ObjectStorageCloseHostResponseSchema
>;
