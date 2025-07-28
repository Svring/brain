import { z } from "zod";

export const AppStartRequestSchema = z.object({
  appName: z.string(),
});

export const AppStartResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type AppStartRequest = z.infer<typeof AppStartRequestSchema>;
export type AppStartResponse = z.infer<typeof AppStartResponseSchema>;