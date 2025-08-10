import { z } from "zod";

export const DeployApiContextSchema = z.object({
  baseURL: z.string().optional(),
  authorization: z.string().optional(),
});

export type DeployApiContext = z.infer<typeof DeployApiContextSchema>;
