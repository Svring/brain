import { z } from "zod";

export const ObjectStorageApiContextSchema = z.object({
  baseUrl: z.string().optional(),
  authorization: z.string().optional(),
});

export type ObjectStorageApiContext = z.infer<
  typeof ObjectStorageApiContextSchema
>;
