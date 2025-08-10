import { z } from "zod";

export const LaunchpadPauseRequestSchema = z.object({
  name: z.string(),
});

export const LaunchpadPauseResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type LaunchpadPauseRequest = z.infer<typeof LaunchpadPauseRequestSchema>;
export type LaunchpadPauseResponse = z.infer<
  typeof LaunchpadPauseResponseSchema
>;
