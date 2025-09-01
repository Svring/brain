import { z } from "zod";

// Container image schema (no defaults here; defaults are applied in composed schemas)
export const ImageSchema = z.string().min(1, "Image is required");

export type Image = z.infer<typeof ImageSchema>;
