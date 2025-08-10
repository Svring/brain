import { z } from "zod";

export const AiProxyApiContextSchema = z.object({
  baseURL: z.string().optional(),
  authorization: z.string().optional(),
});

export type AiProxyApiContext = z.infer<typeof AiProxyApiContextSchema>;
