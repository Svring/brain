import { z } from "zod";

export const DeployStartRequestSchema = z.object({
  appName: z.string(),
});

export const DeployStartResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type DeployStartRequest = z.infer<typeof DeployStartRequestSchema>;
export type DeployStartResponse = z.infer<typeof DeployStartResponseSchema>;
