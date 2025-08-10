import { z } from "zod";

export const LaunchpadStartRequestSchema = z.object({
  name: z.string(),
});

export const LaunchpadStartResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type LaunchpadStartRequest = z.infer<typeof LaunchpadStartRequestSchema>;
export type LaunchpadStartResponse = z.infer<
  typeof LaunchpadStartResponseSchema
>;
