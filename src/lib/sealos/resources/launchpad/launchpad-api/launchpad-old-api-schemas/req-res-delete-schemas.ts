import { z } from "zod";

export const LaunchpadDeleteRequestSchema = z.object({
  name: z.string(),
});

export const LaunchpadDeleteResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type LaunchpadDeleteRequest = z.infer<
  typeof LaunchpadDeleteRequestSchema
>;
export type LaunchpadDeleteResponse = z.infer<
  typeof LaunchpadDeleteResponseSchema
>;
