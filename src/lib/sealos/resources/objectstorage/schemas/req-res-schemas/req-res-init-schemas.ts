import { z } from "zod";

export const ObjectStorageInitResponseSchema = z.object({
  code: z.number(),
  statusText: z.string(),
  message: z.string(),
  data: z.object({
    secret: z.object({
      CONSOLE_ACCESS_KEY: z.string(),
      CONSOLE_SECRET_KEY: z.string(),
      internal: z.string(),
      external: z.string(),
      specVersion: z.number(),
      version: z.number(),
    }),
  }),
});

export type ObjectStorageInitResponse = z.infer<
  typeof ObjectStorageInitResponseSchema
>;
