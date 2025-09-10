import { z } from "zod";

// Image registry schema
const ImageRegistrySchema = z.object({
  username: z.string(),
  password: z.string(),
  serverAddress: z.string(),
});

export const ImageSchema = z.object({
  imageName: z.string().optional(),
  imageRegistry: ImageRegistrySchema.nullable().optional(),
});

export type Image = z.infer<typeof ImageSchema>;
export type ImageRegistry = z.infer<typeof ImageRegistrySchema>;
