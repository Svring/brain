import { z } from "zod";

// Image registry schema
export const ImageRegistrySchema = z.object({
  username: z.string(),
  password: z.string(),
  serverAddress: z.string(),
});

export type ImageRegistry = z.infer<typeof ImageRegistrySchema>;
