import { z } from "zod";
import { ImageSchema } from "@/schemas/forms/universal/image-schema";
import { ImageRegistrySchema } from "@/schemas/forms/universal/image-registry-schema";

export const ImageConfigSchema = z.object({
  imageName: ImageSchema.optional(),
  imageRegistry: ImageRegistrySchema.nullable().optional(),
});

export type ImageConfig = z.infer<typeof ImageConfigSchema>;
