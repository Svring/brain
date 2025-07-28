import { z } from "zod";

export const DeployPauseRequestSchema = z.object({
  appName: z.string(),
});

export const DeployPauseResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type DeployPauseRequest = z.infer<typeof DeployPauseRequestSchema>;
export type DeployPauseResponse = z.infer<typeof DeployPauseResponseSchema>;
