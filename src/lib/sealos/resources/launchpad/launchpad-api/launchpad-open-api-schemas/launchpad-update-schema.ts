import { z } from "zod";
import { ResourceSchema, EnvSchema } from "./launchpad-create-schema";

// Launchpad Update Request Schema
export const LaunchpadUpdateRequestSchema = z.object({
  resource: ResourceSchema.optional(),
  command: z.string().optional(),
  args: z.string().optional(),
  image: z.string().optional(),
  env: z.array(EnvSchema).optional(),
});

// Export types
export type LaunchpadUpdateRequest = z.infer<
  typeof LaunchpadUpdateRequestSchema
>;
