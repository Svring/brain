import { z } from "zod";

export const DeployDeleteRequestSchema = z.object({
  name: z.string(),
});

export const DeployDeleteResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type DeployDeleteRequest = z.infer<typeof DeployDeleteRequestSchema>;
export type DeployDeleteResponse = z.infer<typeof DeployDeleteResponseSchema>;
